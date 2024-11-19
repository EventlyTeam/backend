const passport = require('passport');
const bcrypt = require('bcrypt');

const GoogleStrategy = require('passport-google-oauth2').Strategy;

const User = require('../models/user');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.SERVER_URL}${process.env.GOOGLE_CALLBACK_URL}`,
            scope: ['profile', 'email']
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const response = await fetch(`https://people.googleapis.com/v1/people/me?personFields=birthdays&key=${process.env.GOOGLE_API_KEY}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const data = await response.json();
                
                let birthday = null;
                if (data.birthdays && data.birthdays[0] && data.birthdays[0].date) {
                    const date = data.birthdays[0].date;
                    if (date.day && date.month && date.year) {   
                        birthday = `${birthday.day}.${birthday.month}.${birthday.year}`;
                    }
                }

                let user = await User.findOne({
                    where: { username: profile.email }
                });

                if (!user) {
                    user = await User.create({
                        username: profile.email,
                        birthday: birthday
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