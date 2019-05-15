const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// Routes
// REST API
/* 
    Create : 생성(POST)
    Read : 조회(GET)
    Update : 수정(PUT)
    Delete : 삭제(DELETE)
*/

// Index
router.get("/", (req, res) => {
    Contact.find({}, (err, contacts) => {
        if(err){ return res.json(err); }
        res.render("contacts/index", {contacts:contacts});
    });
});

// New
router.get("/new", (req, res) => {
    res.render("contacts/new");
});

// create
router.post("/", (req, res) => {
    Contact.create(req.body, (err, contact) => {
        if(err){ return res.json(err); }
        res.redirect("/contacts");
    });
});

// show
router.get("/:id", (req, res) => {
    Contact.findOne({_id:req.params.id}, (err, contact) => {
        if(err){ return res.json(err); }
        res.render("contacts/show", {contact:contact});
    });
});

// edit
router.get("/:id/edit", (req, res) => {
    Contact.findOne({_id:req.params.id}, (err, contact) => {
        if(err){ return res.json(err); }
        res.render("contacts/edit", {contact:contact});
    });
});

// update
router.put("/:id", (req, res) => {
    Contact.findOneAndUpdate({_id:req.params.id}, req.body, (err, contact) => {
        if(err){ return res.json(err); }
        res.redirect("/contacts/"+req.params.id);
    });
});

// destroy
router.delete("/:id", (req, res) => {
    Contact.remove({_id:req.params.id}, (err) => {
        if(err){ return res.json(err); }
        res.redirect("/contacts");
    });
});

module.exports = router;