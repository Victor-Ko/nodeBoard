const express = require("express");
const router = express.Router();
const User  = require("../models/User");

// Index
router.get("/", function(req, res){
    User.find({}).sort({username:1}).exec((err, users) => {
        if(err){ return res.json(err); }
        res.render("users/index", {users:users});
    });
});

// New
router.get("/new", (req, res) => {
    res.render("users/new", {user:{}});
});

// create
router.post("/", (req, res) => {
    User.create(req.body, (err) => {
        if(err){ return res.json(err); }
        res.redirect("/users");
    });
});

// show
router.get("/:username", (req, res) => {
    User.findOne({username:req.params.username}, (err, user) => {
        if(err){ return res.json(err); }
        res.render("users/show", {user:user});
    });
});

// edit
router.get("/:username/edit", (req, res) => {
    User.findOne({username:req.params.username}, (err, user) => {
        if(err){ return res.json(err); }
        res.render("users/edit", {user:user});
    });
});

// update
router.put("/:username",(req, res, next)=> {
    User.findOne({username:req.params.username}).select("password").exec((err, user) => {
        if(err){ return res.json(err); }
        // update user object
        user.originalPassword = user.password;
        user.password = req.body.newPassword? req.body.newPassword : user.password;
        for(var p in req.body){
            user[p] = req.body[p];
        }
        // save updated user
        user.save((err, user) => {
            if(err){ return res.json(err); }
            res.redirect("/users/"+req.params.username);
        });
    });
});

module.exports = router;