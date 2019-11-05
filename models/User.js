const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    token: [{
        passwordChange: { type: String, default: null }
    }]
}, { timestamps: true })

UserSchema.virtual('username').get(function () {
    return this.firstName + ' ' + this.lastName;
});
UserSchema.virtual('accessToken').get( function () {
    return jwt.sign({id:this.id},process.env.JWT_TOKEN_SEC);
});

UserSchema.statics.emailIsTaken = async function (email) {
    let user = await this.findOne({ email:email });
    return _.isEmpty(user) ? false : true ;
}


module.exports = mongoose.model("User", UserSchema);