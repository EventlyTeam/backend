const {body} = require('express-validator');

/*
    Password rules (at least):
    - 10 characters length
    - 2 letters in uppercase
    - 1 special character
    - 2 numerals (0-9)
    - 3 letters in lowercase
*/

const emailValidator = body('email').isEmail().withMessage('Email has wrong format');
const passwordValidator = body('password')
    .isLength({ min: 10 }).withMessage('Password must be at least 10 characters long')
    .matches(/[A-Z].*[A-Z]/).withMessage('Password must contain at least 2 uppercase letters')
    .matches(/[a-z].*[a-z].*[a-z]/).withMessage('Password must contain at least 3 lowercase letters')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least 1 special character')
    .matches(/\d.*\d/).withMessage('Password must contain at least 2 numbers');

module.exports =  {
    emailValidator,
    passwordValidator,
};