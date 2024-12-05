const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const {validationResult} = require('express-validator');
const tokenService = require('../service/TokenService')

const User = require('../models/user')
const ApiError = require('../error/ApiError');
const UserDto = require('../dtos/UserDto');
const Role = require('../models/role');
const { Op } = require('sequelize');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(errors.array()))
            }

            const {username, password, email, birthday} = req.body;

            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username },
                        { email }
                    ]
                }
            });

            if (user) {
                return next(ApiError.badRequest('User with such email or username exists!'))
            }
            
            const hashedPassword = await bcrypt.hash(password, 5)
            const newUser = await User.create({
                username, password: hashedPassword, email: email, birthday: birthday
            });
            
            const userData = await User.findByPk(newUser.id, {
                include: { model: Role, attributes: ['name'] }
            });

            const userDto = new UserDto(userData.dataValues);
            const tokens = tokenService.generateTokens({...userDto});

            await tokenService.saveToken(userDto.id, tokens.refreshToken);
            
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: process.env.REFRESH_TOKEN_MAX_AGE, httpOnly: true})

            res.status(201).json({ message: 'User registered successfully.', user: userDto, ...tokens });
        } catch (e) {
            next(ApiError.internal(e.message))
        }
    }

    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(errors.array()))
            }

            const { username, password } = req.body;
            
            const user = await User.findOne({
                where: { username },
                include: { model: Role, attributes: ['name'] }
            });
            
            if (!user) {
                return next(ApiError.notFound('No user with such username!'));
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return next(ApiError.badRequest('Incorrect password!'));
            }
            
            const userDto = new UserDto(user.dataValues);
            const tokens = tokenService.generateTokens({...userDto});
            await tokenService.saveToken(userDto.id, tokens.refreshToken);

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: process.env.REFRESH_TOKEN_MAX_AGE, httpOnly: true})

            res.json({ message: 'Login successful', user: userDto, ...tokens });
        } catch(e) {
            next(ApiError.internal("An error occurred during login"));
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            
            await tokenService.removeToken(refreshToken);
            res.clearCookie(process.env.REFRESH_TOKEN);
            
            res.json('Successful logout');
        } catch (e) {
            next(ApiError.internal("An error occurred during logout"));
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;

            if (!refreshToken) {
                throw ApiError.nonAuthorized();
            }
            
            const userData = tokenService.validateRefreshToken(refreshToken);
            const tokenFromDb = await tokenService.findToken(refreshToken);
            
            if (!userData || !tokenFromDb) {
                throw ApiError.UnauthorizedError();
            }
            
            const user = await User.findByPk(userData.id);
            const userDto = new UserDto(user);
            const tokens = tokenService.generateTokens({...userDto});
    
            await tokenService.saveToken(userDto.id, tokens.refreshToken);
            res.cookie(process.env.REFRESH_TOKEN, tokens.refreshToken, {maxAge: process.env.REFRESH_TOKEN_MAX_AGE, httpOnly: true})
            
            res.json({ user: userDto, ...tokens });
        } catch (e) {
            next(ApiError.internal("An error occurred during refreshing tokens"));
        }
    }

    async googleAuthCallback(req, res, next) {
        const user = req.user;
        
        const userDto = new UserDto(user.dataValues);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        res.cookie('refreshToken', tokens.refreshToken, {maxAge: process.env.REFRESH_TOKEN_MAX_AGE, httpOnly: true})

        res.status(302).json({ message: 'Login successful', ...tokens });
    }

    async sendVerificationEmail(req, res, next) {
        try {
            const userData = req.user;

            const user = await User.findByPk(userData.id);
            if (!user) {
                return next(ApiError.notFound('User not found'));
            }
            
            if (user.emailVerified) {
                return next(ApiError.forbidden('Email already verified'));
            }
            
            const verificationToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRATION });
    
            const verificationUrl = `${req.protocol}://${req.get('host')}/api/user/verify-email?email=${user.email}&token=${verificationToken}`;
            const htmlMessage = `<p>Hello! Verify your email by clicking on the following link</p>
                <a href=${verificationUrl}>Verify email</a>
            `;
    
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: process.env.SMPT_HOST,
                port: process.env.SMPT_PORT,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            let mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: user.email,
                subject: 'Email Verification',
                html: htmlMessage
            }

            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: 'Verification email was sent' });
        } catch (error) {
            next(ApiError.internal(`Error sending verification email: ${error.message}`));
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const { token, email } = req.query;
    
            jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err) => {
                if (err) {
                    return ApiError.non_authorized('Failed to authenticate token');
                }
            });
            
            const user = await User.findOne({ where: {email} });
            if (!user) {
                return next(ApiError.badRequest('User not found'));
            }
            
            if (user.emailVerified) {
                return next(ApiError.forbidden('Email already verified'));
            }

            user.emailVerified = true;
            await user.save();
    
            res.redirect(process.env.CLIENT_URL)
        } catch (error) {
            next(ApiError.internal('Error verifying email'));
        }
    }
}

module.exports = new UserController();