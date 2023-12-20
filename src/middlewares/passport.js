// libraries
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const googleOAuth = passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
        passReqToCallback: true
    },
    async function (request, accessToken, refreshToken, profile, done) {
        try {
            done(null, profile);
        } catch (err) {
            console.error(err);
        }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

module.exports = {
    googleOAuth
}