const express = require("express");
const router = express.Router();
const Post  = require("../models/Post");
const util  = require("../util");

// Index 
// {createdAt:1}(오름차순), {createdAt:-1}(내림차순) 
router.get("/", (req, res) => {
    Post.find({}).populate("author").sort("-createdAt").exec((err, posts) => {    
        if(err){ return res.json(err); }
        res.render("posts/index", {posts:posts});
    });
});

// New
router.get("/new", util.isLoggedin, (req, res) => {
    const post = req.flash("post")[0] || {};
    const errors = req.flash("errors")[0] || {};
    res.render("posts/new", { post:post, errors:errors });
});

// create
router.post("/", util.isLoggedin, (req, res) => {
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
    Post.findOne({_id:req.params.id}).populate("author").exec((err, post) => { 
        if(err){ return res.json(err); }
        res.render("posts/show", {post:post});
    });
});

// edit
router.get("/:id/edit", util.isLoggedin, checkPermission, (req, res) => {
    const post = req.flash("post")[0];
    const errors = req.flash("errors")[0] || {};
    if(!post){
        Post.findOne({_id:req.params.id}, (err, post) => {
        if(err){ return res.json(err); }
            res.render("posts/edit", { post:post, errors:errors });
        });
    } else {
        post._id = req.params.id;
        res.render("posts/edit", { post:post, errors:errors });
    }
});

// update
router.put("/:id", util.isLoggedin, checkPermission, (req, res) => {
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