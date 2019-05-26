const mongoose = require("mongoose");
const bcrypt   = require("bcrypt-nodejs");

// schema
const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required!"],
        match:[/^.{4,12}$/,"Should be 4-12 characters!"],
        trim:true,
        unique:true //PK설정
    },
    password:{
        type:String,
        required:[true,"Password is required!"],
        select:false //기본조회 방어
    },
    name:{
        type:String,
        required:[true,"Name is required!"],
        match:[/^.{4,12}$/,"Should be 4-12 characters!"],
        trim:true
    },
    email:{
        type:String,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Should be a vaild email address!"],
        trim:true
    }
},{
    toObject:{virtuals:true}
});

// virtuals arrow function 사용불가
userSchema.virtual("passwordConfirmation")
.get(function() { return this._passwordConfirmation; })
.set(function(value) { this._passwordConfirmation=value; });

userSchema.virtual("originalPassword")
.get(function() { return this._originalPassword; })
.set(function(value) { this._originalPassword=value; });

userSchema.virtual("currentPassword")
.get(function() { return this._currentPassword; })
.set(function(value) { this._currentPassword=value; });

userSchema.virtual("newPassword")
.get(function() { return this._newPassword; })
.set(function(value) { this._newPassword=value; });

// password validation
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const passwordRegexErrorMessage = "Should be minimum 8 characters of alphabet and number combination!";
userSchema.path("password").validate((pw) => {
    const user = this;

    // create user
    if(user.isNew){
        if(!user.passwordConfirmation){
        user.invalidate("passwordConfirmation", "Password Confirmation is required!");
        }
        if(!passwordRegex.test(user.password)){
        user.invalidate("password", passwordRegexErrorMessage);
        } else if(user.password !== user.passwordConfirmation) {
        user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }

    // update user
    if(!user.isNew){
        if(!user.currentPassword){
        user.invalidate("currentPassword", "Current Password is required!");
        }
        if(user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)){
        user.invalidate("currentPassword", "Current Password is invalid!");
        }
        if(user.newPassword !== user.passwordConfirmation) {
        user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }
});

// hash password
// Schema.pre 함수는 첫번째 파라미터로 설정된 event가 일어나기 전(pre)에 먼저 callback 함수를 실행
userSchema.pre("save", (next) => {
    const user = this;
    if(!user.isModified("password")){
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

// model methods
userSchema.methods.authenticate = function (password) {
    const user = this;
    return bcrypt.compareSync(password,user.password);
};

// model & export
const User = mongoose.model("user",userSchema);
module.exports = User;
