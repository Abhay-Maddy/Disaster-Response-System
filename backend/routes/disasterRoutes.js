const express = require('express');
const router = express.Router();
const { getDisasters, addDisaster } = require('../controllers/disasterController');

router.route('/')
    .get(getDisasters)
    .post(addDisaster);

module.exports = router;
