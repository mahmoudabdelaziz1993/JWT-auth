const router = require('express').Router();
const User = require('../models/User');
const { body, check, validationResult } = require('express-validator');
const _ = require('lodash');




router.post('/login', [
    check('email').isEmail(),
    check('password', 'password must be at lest 5 characters ').isLength({ min: 5 })]
    ,
    async (req, res) => {
        const validationErrors = validationResult(req);
        if (!_.isEmpty(validationErrors.errors)) {
            validationErrors.errors.map(({ param, msg }) => {
                let mapErr = {
                    field: param,
                    err_msg: msg
                }
                res.send(mapErr);
            })
        }
        try {
            let user = await User.isValidUser(req.body.email, req.body.password);
            res.send({ accessToken: user.accessToken , refreshToken :user.refreshToken});
        } catch (error) {
            res.sendStatus(400)
        }
    });







router.post('/register', [
        check('email').isEmail().custom(async (email) => {
            if (await User.emailIsTaken(email))
                return Promise.reject('this E-mail already in use ');
        }),
        check('password', 'password must be at lest 5 characters ').isLength({ min: 5 }),
        check('firstName', 'invalid first name ').isLength({ min: 2 }),
        check('lastName', 'invalid last name ').isLength({ min: 2 }),
        body('confirmPassword')
            .isLength({ min: 5 })
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                // Indicates the success of this synchronous custom validator
                return true;
            })
    ], async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const validationErrors = validationResult(req);

        if (_.isEmpty(validationErrors.errors)) {
            let user = new User(req.body)
            await user.save();
            res.sendStatus(201);
        }
        validationErrors.errors.map(({ param, msg }) => {
            let mapErr = {
                field: param,
                err_msg: msg
            }
            res.send(mapErr);
        });
    });

router.post('/refresh',[
    check('password').isLength(5)
],async  (req, res) => {
    let token  = req.header('refresh').split(' ')[1]
    try {
        let Refresh_Token = await User.refreshToken(req.body.password,token);
        res.send({Refresh_Token});
    } catch (error) {
        res.sendStatus(400)
    }
});

module.exports = router;