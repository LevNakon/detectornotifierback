const { Router } = require("express");
const config = require('config');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

const userRouter = Router();

// Create a new user
userRouter.post('/', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const user = new User({ email, password, firstName, lastName });
        await user.save()
        await user.generateAuthToken();
        res.status(201).send({ message: 'Successfully created user', success: true });
    } catch (error) {
        res.status(400).send(error);
    }
});

//Login a registered user
userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findByCredentials(email, password);
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' });
        }
        jwt.verify(user.token, config.get(`${process.env.NODE_ENV}.jwtkey`), async (err, result) => {
            if (err && err.name === "TokenExpiredError") {
                user = await user.generateAuthToken();
                res.status(200).send({ message: 'Sign In successful!', success: true, user });
            } else if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).send({ message: 'Sign In successful!', success: true, user });
            }
        });
    } catch (error) {
        res.status(400).send(error);
    }

});

module.exports = userRouter;