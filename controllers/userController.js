const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const User = require('../models/user')
const ApiError = require('../error/ApiError')

class UserController {
    async registration(req, res, next) {
        try {
            const {username, password} = req.body
            if (!username || !password) {
                return next(ApiError.badRequest("Email and password are required!"))
            }
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

    async login(req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                console.log(err);
                return next(err);
            }
            
            if (!user) {
                return res.status(401).json({message: info.message})
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: 'Login successful', token });
        })(req, res, next);
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