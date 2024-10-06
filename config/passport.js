const passport = require('passport');
const bcrypt = require('bcrypt');

const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const User = require('../models/user');

// Serialize user (stores user id in session)
passport.serializeUser((user, done) => {
    console.log(user)
    done(null, user.id);
});

// Deserialize user (retrieves user data based on id in session)
passport.deserializeUser((id, done) => {
    User.findByPk(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});

// Local Strategy for authentication with email and password
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

module.exports = passport;