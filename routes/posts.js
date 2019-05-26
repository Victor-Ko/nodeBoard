const express = require("express");
const router = express.Router();
const Post  = require("../models/Post");
const util  = require("../util");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Index 
// {createdAt:1}(오름차순), {createdAt:-1}(내림차순) 
router.get("/", (req, res) => {
    // // relationship이 형성되어 있는 항목의 값을 생성. 현재 post의 author에는 user의 id가 기록되어 있는데, 이 값을 바탕으로 실제 user의 값을 author에 생성.
    Post.find({}).populate("author").sort("-createdAt").exec((err, posts) => {    
        if(err){ return res.json(err); }
        res.render("posts/index", {posts:posts});
    });
});

// New
router.get("/new", util.isLoggedin, csrfProtection, (req, res) => {
    const post = req.flash("post")[0] || {};
    const errors = req.flash("errors")[0] || {};
    res.render("posts/new", { post:post, csrfToken : req.csrfToken(), errors:errors });
});

// create
router.post("/", util.isLoggedin, csrfProtection, (req, res) => {
    req.body.author = req.user._id;
    Post.create(req.body, (err, post) => {
        if(err){
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/new");
        }
        res.redirect("/posts");
    });
});

// show
router.get("/:id", (req, res) => {
    // relationship이 형성되어 있는 항목의 값을 생성. 현재 post의 author에는 user의 id가 기록되어 있는데, 이 값을 바탕으로 실제 user의 값을 author에 생성.
    Post.findOne({_id:req.params.id}).populate("author").exec((err, post) => { 
        if(err){ return res.json(err); }
        res.render("posts/show", {post:post});
    });
});

// edit
router.get("/:id/edit", util.isLoggedin, checkPermission, csrfProtection, (req, res) => {
    const post = req.flash("post")[0];
    const errors = req.flash("errors")[0] || {};
    if(!post){
        Post.findOne({_id:req.params.id}, (err, post) => {
        if(err){ return res.json(err); }
            res.render("posts/edit", { post:post, csrfToken : req.csrfToken(), errors:errors });
        });
    } else {
        post._id = req.params.id;
        res.render("posts/edit", { post:post, csrfToken : req.csrfToken(), errors:errors });
    }
});

// update
router.put("/:id", util.isLoggedin, checkPermission, csrfProtection, (req, res) => {
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, (err, post) => {
        if(err){
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/"+req.params.id+"/edit");
        }
        res.redirect("/posts/"+req.params.id);
    });
});

// destroy
router.delete("/:id", util.isLoggedin, checkPermission, (req, res) => {
    Post.remove({_id:req.params.id}, (err) => {
        if(err){ return res.json(err); }
        res.redirect("/posts");
    });
});

module.exports = router;

function checkPermission(req, res, next){
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err){ return res.json(err); }
        if(post.author != req.user.id){ return util.noPermission(req, res); }
        next();
    });
}