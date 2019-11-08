const jwt = require('jsonwebtoken');
const User = require('../models/User');
const _ = require('lodash');
require('dotenv').config();

async function authorizedToken(req, res, next) {
    let authHeader = req.header('Authorization')
    let accessToken = authHeader && authHeader.split(' ')[1];
    if (accessToken == null) {
        res.sendStatus(401);
    }
    try {
        let payload = await jwt.verify(accessToken, process.env.JWT_TOKEN_SEC);
        let user = await User.findById(payload.id);
            req.user = user;
            next();
    } catch (error) {
        res.sendStatus(401);
    }
}
module.exports = authorizedToken;