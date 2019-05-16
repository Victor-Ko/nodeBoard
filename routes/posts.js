const express = require("express");
const router = express.Router();
const Post  = require("../models/Post");

// Index 
// {createdAt:1}(오름차순), {createdAt:-1}(내림차순) 
router.get("/", (req, res) => {
    Post.find({}).sort("-createdAt").exec((err, posts) => {    
        if(err){ return res.json(err); }
        res.render("posts/index", {posts:posts});
    });
});

// New
router.get("/new", (req, res) => {
    res.render("posts/new");
});

// create
router.post("/", (req, res) => {
    Post.create(req.body, (err, post) => {
        if(err){ return res.json(err); }
        res.redirect("/posts");
    });
});

// show
router.get("/:id", (req, res) => {
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err){ return res.json(err); }
        res.render("posts/show", {post:post});
    });
});

// edit
router.get("/:id/edit", (req, res) => {
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err){ return res.json(err); }
        res.render("posts/edit", {post:post});
    });
});

// update
router.put("/:id", (req, res) => {
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, (err, post) => {
        if(err){ return res.json(err); }
        res.redirect("/posts/"+req.params.id);
    });
});

// destroy
router.delete("/:id", (req, res) => {
    Post.remove({_id:req.params.id}, (err) => {
        if(err){ return res.json(err); }
        res.redirect("/posts");
    });
});

module.exports = router;