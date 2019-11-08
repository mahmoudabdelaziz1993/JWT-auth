const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
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
UserSchema.pre('save', async function (next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
        next();
    } catch (error) {
        next(error);
    }
});
UserSchema.virtual('username').get(function () {
    return this.firstName + ' ' + this.lastName;
});
UserSchema.virtual('accessToken').get(function () {
    return jwt.sign({ id: this.id, password: this.password }, process.env.JWT_TOKEN_SEC, { expiresIn: "1d" });
});

UserSchema.virtual('refreshToken').get(function () {
    return jwt.sign({ id: this.id, password: this.password }, process.env.JWT_TOKEN_REFRESH, { expiresIn: "2d" });
});

UserSchema.statics.emailIsTaken = async function (email) {
    let user = await this.findOne({ email: email });
    return _.isEmpty(user) ? false : true;
}
UserSchema.statics.refreshToken = async function (password, token) {
    console.log("password",password);
    console.log("token",token);
    let payload = await jwt.verify(token, process.env.JWT_TOKEN_REFRESH);
    
    let user = await this.findById(payload.id);
    console.log("compare ",await user.comparePassword(password));
    if (await user.comparePassword(password)) {
        return jwt.sign({ id: this.id, password: this.password }, process.env.JWT_TOKEN_SEC, { expiresIn: "1d" })
    }
    throw new Error('corrupted ');
}

UserSchema.methods.comparePassword = async function (pass) {
    password = pass.toString();
    return await bcrypt.compare(password, this.password);
}

UserSchema.statics.isValidUser = async function (email, password) {
    let user = await this.findOne({ email });
    let check = await user.comparePassword(password);
    if (check) return user;
    throw new Error('nor user');
}


module.exports = mongoose.model("User", UserSchema);
