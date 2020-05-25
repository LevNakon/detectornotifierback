const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: Schema.Types.String,
        unique: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' });
            }
        },
    },
    firstName: {
        type: Schema.Types.String,
    },
    lastName: {
        type: Schema.Types.String,
    },
    password: {
        type: Schema.Types.String,
        minLength: 6,
    },
    token: {
        type: Schema.Types.String,
    },
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id },
        config.get(`${process.env.NODE_ENV}.jwtkey`),
        { expiresIn: '7 days' }
    );
    user.token = token;
    await user.save();
    return user;
}

userSchema.statics.findByCredentials = async function (email, password) {
    const User = this;
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' });
    }
    return user;
}

module.exports = mongoose.model('User', userSchema);