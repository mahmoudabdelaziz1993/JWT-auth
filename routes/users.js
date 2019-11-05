const router = require('express').Router();
const User = require('../models/User');
const { body,check, validationResult } = require('express-validator');
const _ = require('lodash')


router.post('/login', async (req, res) => {
    res.status(304).send({ success: true });


});

router.post('/register', [
    check('email').isEmail().custom(async (email) => {
        if (await User.emailIsTaken(email))
            return Promise.reject('this E-mail already in use ')
    }),
    check('password').isLength({ min: 5 }),
    check('firstName').isLength({ min: 2 }),
    check('lastName').isLength({ min: 2 }),
    body('confirmPassword')
    .isLength({ min: 5 })
    .custom((value,{req})=>{
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
        res.send({token:user.accessToken});
    }
    validationErrors.errors.map(({param,msg})  => {
        let mapErr = {
            field : param,
            err_msg :msg
        }
        res.send(mapErr);
    });
});

router.get('/logout', (req, res) => {
    res.status(304).send({ success: true });
});

module.exports = router;