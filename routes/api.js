const router = require('express').Router()
const authorized = require('../middlewares/JWTauth');

router.get('/',authorized,(req,res)=>res.sendStatus(200))
module.exports = router