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
        console.log("payload", payload);
        let user = await User.findById(payload.id);
        console.log("user", user);
        console.log("compare password",await user.comparePassword(req.body.password));
        if (await user.comparePassword(req.body.password)&& req.body.email == user.email) {
            req.user = user;
            next();
        }
        res.sendStatus(401);
    } catch (error) {
        res.sendStatus(401);
    }
}
module.exports = authorizedToken;