const shortid = require('shortid');
const axios = require('axios');
const Url = require('../models/url.model');
const User = require('../models/user.model');
const cache = require('memory-cache');

// URL Shortening
exports.shortenUrl = async (req, res) => {
  const { url, customUrl } = req.body;

  //   Check if the custom URL is available
  if (customUrl) {
    const existingUrl = await Url.findOne({ customUrl });
    if (existingUrl) {
      return res.status(400).json({ error: 'Custom URL is already taken' });
    }
  }

  // // Check if the URL is already cached
  const cachedUrl = cache.get(url);
  if (cachedUrl) {
    return res.json(cachedUrl);
  }

  try {
    // Check if the URL is reachable by making an HTTP request
    const validUrl = await axios.get(url)
    console.log(validUrl.status)
    if (validUrl.status !== 200) {
      throw new Error("Invalid url")
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`
    // Generate short URL
    const shortUrl = `${baseUrl}/${customUrl}` || `${baseUrl}/${shortid.generate()}`

    // // Create a new URL object
    const urlObj = new Url({
      longUrl: url,
      shortUrl,
      customUrl,
      // user: req.user._id,
    });

    // // Save the URL to the database
    await urlObj.save();

    // // Cache the URL
    cache.put(url, urlObj);

    return res.json({ urlObj })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
};

exports.getUrl = async (req, res) => {
  const { customUrl } = req.params;
  console.log(customUrl)

  try {
    const existingUrl = await Url.findOne({ customUrl });
    if (!existingUrl) {
      return res.status(400).json({ error: 'invalid url' })
    }

    existingUrl.clicks += 1
    await existingUrl.save()

    res.redirect(existingUrl.longUrl)
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
};