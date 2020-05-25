const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data = jwt.verify(token, config.get(`${process.env.NODE_ENV}.jwtkey`));
        const user = await User.findOne({ _id: data._id, token });
        if (!user) {
            throw new Error();
        }
        req.token = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}

module.exports = auth;