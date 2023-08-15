const Joi = require("joi")

const validator = (schema) => (payload) => schema.validate(payload, {abortEarly: false})

const signupSchema = Joi.object({
    firstname: Joi.string().min(2).max(20).required(),
    lastname: Joi.string().min(2).max(20).required(),
    email: Joi.string().email({tlds: {allow: true}}).pattern(new RegExp(/^\S+@\S+\.\S+$/)).required(),
    username: Joi.string().min(2).max(20).required(),
    password: Joi.string().min(8).max(250).required(),
})

const loginSchema = Joi.object({
    email: Joi.string().email({tlds: {allow: true}}).pattern(new RegExp(/^\S+@\S+\.\S+$/)).required(),
    password: Joi.string().min(8).max(250).required(),
})

const verifyOtpSchema = Joi.object({
    email: Joi.string().email({tlds: {allow: true}}).pattern(new RegExp(/^\S+@\S+\.\S+$/)).required(),
    otp: Joi.string().min(6).max(6).required()
})

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email({tlds: {allow: true}}).pattern(new RegExp(/^\S+@\S+\.\S+$/)).required()
})
const ChangePasswordSchema = Joi.object({
    email: Joi.string().email({tlds: {allow: true}}).pattern(new RegExp(/^\S+@\S+\.\S+$/)).required(),
    password: Joi.string().min(8).max(250).required(),
})

exports.Signup = validator(signupSchema) 
exports.SignIn = validator(loginSchema) 
exports.OtpVerification = validator(verifyOtpSchema) 
exports.ForgotPass = validator(forgotPasswordSchema) 
exports.ChangePass = validator(ChangePasswordSchema) 
