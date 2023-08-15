const express = require('express');
const urlController = require('../controllers/url.controller');

const router = express.Router();

router.post('/urls', urlController.shortenUrl);
router.get('/:customUrl', urlController.getUrl);

module.exports = router;