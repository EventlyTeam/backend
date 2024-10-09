const passport = require('passport');
const bcrypt = require('bcrypt');

const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const User = require('../models/user');
const { password } = require('pg/lib/defaults');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
        },
        async (username, password, done) => {
            try {
                const user = await User.findOne({ where: { username } });
                if (!user) {
                
                    return done(null, false, { message: 'No user with such email!' });
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return done(null, false, { message: 'Incorrect password!' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.SERVER_URL}${process.env.GOOGLE_CALLBACK_URL}`
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                let user = await User.findOne(
                    { where: { username: profile.email } }
                );

                if (!user) {
                    user = await User.create({
                            username: profile.email,
                            password: null
                    });
                }
                
                return done(null, user)
            } catch(err) {
                console.log(err.message);
                return done(err);
            }
        }
    )
);

module.exports = passport;