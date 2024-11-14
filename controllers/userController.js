const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client();
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
            const {username, password, birthday} = req.body

            this.validateAuthInput(username, password, next)

            const user = await User.findOne({where: {username}})
            if (user) {
                return next(ApiError.badRequest('User with such username exists!'))
            }
            
            const hashedPassword = await bcrypt.hash(password, 5)
            const newUser = await User.create({ username, password: hashedPassword, birthday: birthday });

            return res.status(201).json({ message: 'User registered successfully.', user: newUser });
        } catch (e) {
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
        try {
            req.logout((err) => {
                if (err) {
                    return next(err);
                }

                res.clearCookie('connect.sid');

                return res.json({ message: 'Logout successful', isAuth: req.isAuthenticated() });
            });
        } catch (error) {
            next(ApiError.internal(error));
        }
    }

    async check(req, res, next) {
        return res.json({message: "Ok"})
    }

    async sendVerificationEmail(req, res, next) {
        try {
            const {username} = req.body;
            if (!username) {
                return ApiError.forbidden('User email must be passed');
            }

            const user = await User.findOne({ where: { username } });
            if (!user) {
                return next(ApiError.badRequest('User not found'));
            }
            
            if (user.emailVerified) {
                return next(ApiError.forbidden('Email already verified'));
            }
    
            const verificationToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?email=${username}&token=${verificationToken}`;
            const htmlMessage = `<p>Hello! Verify your email by clicking on the following link</p>
                <a href=${verificationUrl}>Verify email</a>
            `;
    
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            let mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: username,
                subject: 'Email Verification',
                html: htmlMessage
            }

            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: 'Verification email was sent' });
        } catch (error) {
            return next(ApiError.internal('Error sending verification email'));
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const { token, email } = req.query;
    
            jwt.verify(token, process.env.JWT_SECRET, (err) => {
                if (err) {
                    return ApiError.non_authorized('Failed to authenticate token');
                }
            });
            
            const user = await User.findOne({ where: { username: email } });
            if (!user) {
                return next(ApiError.badRequest('User not found'));
            }
            
            if (user.emailVerified) {
                return next(ApiError.forbidden('Email already verified'));
            }

            user.emailVerified = true;
            await user.save();
    
            res.status(200).json({ message: 'Email verified successfully' });
        } catch (error) {
            return next(ApiError.internal('Error verifying email'));
        }
    }

    async verifyGoogleToken(req, res, next) {

        const {token} = req.body;

        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                requiredAudience: process.env.ANDROID_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            
            let userId = payload['email'];

            if(!userId) {
                userId = payload['sub'];
            }

            let user = await User.findOne(
                { where: { username: userId } }
            );

            if (!user) {
                user = await User.create({
                    username: userId,
                    password: null,
                    birthday: null
                });
            }
            
            const jwtToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            res.status(200).json({ token: jwtToken });
        }
        catch(e) {
            return next(ApiError.internal('Cannot verify token'))
        }
    }
}

module.exports = new UserController()