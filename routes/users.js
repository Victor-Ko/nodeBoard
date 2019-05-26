const express = require("express");
const router = express.Router();
const User  = require("../models/User");
const util  = require("../util");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Index
router.get("/", util.isLoggedin, (req, res) => {
    //sort가 있을때 (callback 함수가 exec 함수에 인자로 들어감)
    User.find({}).sort({username:1}).exec((err, users) => {
        if(err){ return res.json(err); }
        res.render("users/index", {users:users});
    });
});

// New
router.get("/new", csrfProtection, (req, res) => {
    // req.flash(문자열, 저장할_값) 의 형태로 저장할_값을 해당 문자열에 저장
    // req.flash(문자열) 인 경우 해당 문자열에 저장된 값들을 배열로 호출
    const user = req.flash("user")[0] || {};
    const errors = req.flash("errors")[0] || {};
    res.render("users/new", { user:user, csrfToken : req.csrfToken(), errors:errors });
});

// create
router.post("/", csrfProtection, (req, res) => {
    User.create(req.body, (err) => {
        if(err){  
            req.flash("user", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/users/new");
        }
        res.redirect("/users");
    });
});

// show
router.get("/:username", util.isLoggedin, (req, res) => {
    User.findOne({username:req.params.username}, (err, user) => {
        if(err){ return res.json(err); }
        res.render("users/show", {user:user});
    });
});

// edit
router.get("/:username/edit", util.isLoggedin, checkPermission, csrfProtection, (req, res) => {
    // req.flash(문자열, 저장할_값) 의 형태로 저장할_값을 해당 문자열에 저장
    // req.flash(문자열) 인 경우 해당 문자열에 저장된 값들을 배열로 호출
    const user = req.flash("user")[0];
    const errors = req.flash("errors")[0] || {};
    if(!user){
        User.findOne({username:req.params.username}, (err, user) => {
            if(err){ return res.json(err); }
            res.render("users/edit", { username:req.params.username, user:user, csrfToken : req.csrfToken(), errors:errors });
        });
    } else {
        res.render("users/edit", { username:req.params.username, user:user, csrfToken : req.csrfToken(), errors:errors });
    }
});

// update
router.put("/:username", util.isLoggedin, checkPermission, csrfProtection, (req, res, next)=> {
    //password조회 name 조회x => .select("password -name")
    User.findOne({username:req.params.username}).select({password:1}).exec((err, user) => {
        if(err){ return res.json(err); }
        // update user object
        user.originalPassword = user.password;
        user.password = req.body.newPassword? req.body.newPassword : user.password;
        for(var p in req.body){
            user[p] = req.body[p];
        }
        // save updated user
        user.save((err, user) => {
            if(err){
                req.flash("user", req.body);
                req.flash("errors", util.parseError(err));
                return res.redirect("/users/"+req.params.username+"/edit");
            }
            res.redirect("/users/"+req.params.username);
        });
    });
});

module.exports = router;

function checkPermission(req, res, next){
    User.findOne({username:req.params.username}, (err, user) => {
        if(err){ return res.json(err); }
        if(user.id != req.user.id){ return util.noPermission(req, res); }
        next();
    });
}