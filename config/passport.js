const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User          = require("../models/User");

// serialize & deserialize User
passport.serializeUser((user, done) => {
    // login시에 DB에서 조회한 user를 어떻게 session에 저장할지를 정하는 부분
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    // request시에 session에서 어떻게 user object를 만들지를 정하는 부분
    User.findOne({_id:id}, (err, user) => {
        done(err, user);
    });
});

// local strategy
passport.use("local-login",
    new LocalStrategy(
        {
            usernameField : "username",
            passwordField : "password",
            passReqToCallback : true
        },
        // 로그인 시에 함수 자동 호출
        (req, username, password, done) => {
            User.findOne({username:username}).select({password:1}).exec((err, user) => {
                if (err){ return done(err); }
                if (user && user.authenticate(password)){
                    // done함수의 첫번째 parameter는 항상 error를 담기 위한 것으로 error가 없다면 null
                    return done(null, user);
                } else {
                    req.flash("username", username);
                    req.flash("errors", {login:"Incorrect username or password"});
                    return done(null, false);
                }
            });
        }
    )
);

module.exports = passport;