const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs"); 

// schema
const userSchema = mongoose.Schema({
    username:{type:String, required:[true,"Username is required!"], unique:true},
    password:{type:String, required:[true,"Password is required!"], select:false},
    name:{type:String, required:[true,"Name is required!"]},
    email:{type:String}
},{
    toObject:{virtuals:true}
});

// virtuals  다큐먼트에는 없지만 객체에는 있는 가상의 필드
userSchema.virtual("passwordConfirmation").get(() => { 
    return this._passwordConfirmation; 
}).set((value) => { 
    this._passwordConfirmation=value; 
});

userSchema.virtual("originalPassword").get(() => { 
    return this._originalPassword; 
}).set((value) => { 
    this._originalPassword=value; 
});

userSchema.virtual("currentPassword").get(() => { 
    return this._currentPassword; 
}).set((value) => { 
    this._currentPassword=value; 
});

userSchema.virtual("newPassword").get(() => { 
    return this._newPassword; 
}).set((value) => { 
    this._newPassword=value; 
});

// password validation
userSchema.path("password").validate((v) => {
    console.log(this);
    console.log(this.isNew);

    // create user
    if(this.isNew){
        if(!this._passwordConfirmation){
            this.invalidate("passwordConfirmation", "Password Confirmation is required!");
        }
        if(user._password !== user._passwordConfirmation) {
            this.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }

    // update user 
    if(!this.isNew){
        if(!this._currentPassword){
            this.invalidate("currentPassword", "Current Password is required!");
        }
        if(this._currentPassword && this._currentPassword != this._originalPassword){
            this.invalidate("currentPassword", "Current Password is invalid!");
        }
        if(this._newPassword !== this._passwordConfirmation) {
            this.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }
});

// hash password
/*
userSchema.pre("save", function (next){
    let user = this;
    if(!user.isModified("password")){
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password); 
        return next();
    }
});
*/
// model methods 
userSchema.methods.authenticate = function (password) {
    let user = this;
    return bcrypt.compareSync(password,user.password);
};

// model & export
const User = mongoose.model("user",userSchema);
module.exports = User;