const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
    name:{type:String, required:true, unique:true},
    email:{type:String},
    phone:{type:String}
});

const Contact = mongoose.model("contact", contactSchema);

module.exports = Contact;