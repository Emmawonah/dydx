const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Token = require('../models/otp.model')
const sendMail = require('../utils/sendEmail')
const random = require('../utils/generateOtp')
const template = require('../files/email_verification')
const validate = require('../utils/validators')

/**
 * @desc Sign up
 * @param : firstname, lastname, email and password
 * */

exports.signup = async (req, res) => {
    try {
        const { firstname, lastname, email, username, password } = req.body;

        // Validating request body data
        const { error } = validate.Signup(req.body);
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                status: "error",
                message: errorMessages,
            });
        }

        const now = new Date();
        const expiry = new Date(now.getTime() + 5 * 60 * 1000);

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.status === "active") {
                return res.status(400).json({
                    status: "error",
                    message: "Oops! Account already exists. Please try logging in.",
                });
            } else if (existingUser.status === "inactive") {
                const otp = random(6, '123456789');
                await Promise.all([
                    sendMail(email, 'Email Address Verification', template.replace('{{otp}}', otp)),
                    Token.findOneAndDelete({ userId: existingUser._id }),
                    new Token({ userId: existingUser._id, token: otp, expiry }).save(),
                ]);

                return res.status(201).json({
                    status: "success",
                    message: "An OTP has been sent to your mail",
                });
            }
        } else {
            const hashedPass = await bcrypt.hash(password, 10);
            const newUser = new User({
                firstname,
                lastname,
                email,
                username,
                password: hashedPass,
            });

            const otp = random(6, '123456789');
            await Promise.all([
                sendMail(email, 'Email Address Verification', template.replace('{{otp}}', otp)),
                newUser.save(),
                new Token({ userId: newUser._id, token: otp, expiry }).save(),
            ]);

            const userWithoutPassword = { ...newUser._doc };
            delete userWithoutPassword.password;

            return res.status(201).json({
                status: "success",
                message: "An OTP has been sent to your mail",
                data: userWithoutPassword,
            });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request",
        });
    }
};

/**
 * @desc Verify OTP
 * @param : email and otp
 * */

exports.verifyOtp = async (req, res) => {
    try {
        // Validating request body data
        const { error, value } = validate.OtpVerification(req.body)
        if (error) {
            const errorMessages = error.details.message || error.details.map((detail) => detail.message);
            return res.status(400).json({
                status: "error",
                message: errorMessages,
            });
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(404).json({ status: "error", message: "User not found!" })

        const token = await Token.findOne({
            userId: user._id,
            token: req.body.otp
        })

        if (!token) return res.status(404).json({ status: "error", message: "Invalid otp" })

        if (token.expiry < Date.now()) return res.status(400).json({ status: "error", message: "OTP has expired. request for a new one!" })

        if (user.status === "active") return res.status(200).json({
            status: "success",
            message: "Email address verified!"
        })

        const newUser = await User.findOneAndUpdate({ _id: user._id }, { status: "active" }, { new: true })

        const { password, ...others } = newUser._doc

        await token.deleteOne()

        res.status(200).json({
            status: "success",
            message: "Email address verified!",
            data: others
        })
    } catch (error) {
        console.error(error.message)
        throw new Error(error.message)
    }
}

/**
 * @desc Log in
 * @param : email and password
 * */

exports.login = async (req, res) => {
    try {
        // Validating request body data
        const { error, value } = validate.SignIn(req.body)
        if (error) {
            const errorMessages = error.details.message || error.details.map((detail) => detail.message);
            return res.status(400).json({
                status: "error",
                message: errorMessages,
            });
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(404).json({ status: "error", message: "Invalid Credentials!" })

        const passwordIsValid = await bcrypt.compare(req.body.password, user.password)
        if (!passwordIsValid) return res.status(400).json({ status: "error", message: "Invalid Credentials!" })

        let token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.EXPIRES_IN
        });

        const { password, ...others } = user._doc

        res.status(200).json({
            message: "success",
            data: others,
            token
        });

    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * @desc Forgot Password
 * @param : email
 * */

exports.forgotPassword = async (req, res) => {
    try {
        // Validating request body data
        const { error, value } = validate.ForgotPass(req.body)
        if (error) {
            const errorMessages = error.details.message || error.details.map((detail) => detail.message);
            return res.status(400).json({
                status: "error",
                message: errorMessages,
            });
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user || user.status === "inactive") return res.status(404).json({ status: "error", message: "Invalid Credentials!" })

        const now = new Date();
        const expiry = new Date(now.getTime() + 5 * 60 * 1000)

        // Generate OTP and send to the email address gotten from the req body
        const otp = random(6, '123456789')
        await sendMail(req.body.email, 'Forgot Password', template.replace('{{otp}}', otp))

        await new Token({
            userId: user._id,
            token: otp,
            expiry
        }).save()

        const { password, ...others } = user._doc

        res.status(200).json({
            status: "success",
            message: "An OTP has been sent to your email address",
            data: others
        });

    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * @desc Change Password
 * @param : email and password
 * */

exports.changePassword = async (req, res) => {
    try {
        // Validating request body data
        const { error, value } = validate.ChangePass(req.body)
        if (error) {
            const errorMessages = error.details.message || error.details.map((detail) => detail.message);
            return res.status(400).json({
                status: "error",
                message: errorMessages,
            });
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user || user.status === "inactive") return res.status(404).json({ status: "error", message: "User not found" })

        const passwordIsValid = await bcrypt.compare(req.body.password, user.password)
        if (!passwordIsValid) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            await User.findOneAndUpdate({ _id: user._id }, { password: hashedPassword }, { new: true })

            const { password, ...others } = user._doc

            return res.status(200).json({
                status: "success",
                message: "Password changed successfully!",
                data: others
            });

        } else {
            throw new Error("Password cannot be the same as your previous password")
        }
    } catch (err) {
        throw new Error(error.message)
    }
}

// User logout (clear token)
exports.logout = (req, res) => {
    res.clearCookie('token').json({ message: 'Logout successful' });
};
