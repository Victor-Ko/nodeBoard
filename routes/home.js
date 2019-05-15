const express = require("express");
const router = express.Router(); 

// Home 
router.get("/", function(req, res){
    res.redirect("/contacts");
});

module.exports = router;