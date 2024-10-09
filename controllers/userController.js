const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const User = require('../models/user')
const ApiError = require('../error/ApiError')

const { validateEmail, validatePassword } = require('../utils/Validation')

class UserController {
    
    validateAuthInput = (username, password, next) => {
        if (!validateEmail(username)) {
            return next(ApiError.badRequest("Invalid email format!"));
        }

        if (!validatePassword(password)) {
            return next(ApiError.badRequest("Password must be at least 10 characters long, contain at least 2 uppercase letters, 1 special character, 2 digits, and 3 lowercase letters!"));
        }
    };

    registration = async (req, res, next) => {
        try {
            const {username, password} = req.body

            this.validateAuthInput(username, password, next)

            const user = await User.findOne({where: {username}})
            if (user) {
                return next(ApiError.badRequest('User with such data exists!'))
            }
            
            const hashedPassword = await bcrypt.hash(password, 5)
            const newUser = await User.create({ username, password: hashedPassword });

            return res.status(201).json({ message: 'User registered successfully.', user: newUser });
        } catch (e) {
            console.log(e)
            return next(ApiError.badRequest(e.message))
        }
    }

    login = async (req, res, next) => {
        try {
            const { username, password } = req.body;

            this.validateAuthInput(username, password, next)
            
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return next(ApiError.badRequest('No user with such email!'));
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return next(ApiError.badRequest('Incorrect password!'));
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: 'Login successful', token });
        } catch(e) {
            console.log(err);
            return next(ApiError.internal("An error occurred during login"));
        }
    }

    async googleAuth(req, res, next) {
        passport.authenticate('google', {
            scope: ['email', 'profile']
        })(req, res);
    }

    async googleAuthCallback(req, res, next) {
        passport.authenticate('google', { session: false }, (err, user, _) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.redirect('/');
            }
            
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Login successful', token });
        })(req, res, next);
    }

    async logout(req, res, next) {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
        });
        res.clearCookie('connect.sid');
        return res.json({message: 'Logout successful', isAuth: req.isAuthenticated()});
    }

    async check(req, res, next) {
        return res.json({message: "Ok"})
    }
}

module.exports = new UserController()