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

const User = mongoose.model("user",userSchema);

// password validation
userSchema.path("password").validate((pw) => {
    const userInfo = this;
    User.find({ password : pw }, (err, rs) => {
        if (err){ return res(err); }
        if (!rs.length){
            // create user
            if(!userInfo._passwordConfirmation){
                userInfo.invalidate("passwordConfirmation", "Password Confirmation is required!");
            }
            if(pw !== userInfo._passwordConfirmation) {
                userInfo.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
            }
        }else{      
            // update user           
            if(!userInfo._currentPassword){
                userInfo.invalidate("currentPassword", "Current Password is required!");
            }
            if(userInfo._currentPassword && !bcrypt.compareSync(user._currentPassword, user._originalPassword)){
                userInfo.invalidate("currentPassword", "Current Password is invalid!");
            }
            if(userInfo._newPassword !== userInfo._passwordConfirmation) {
                userInfo.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
            }
        }
    });

    /*
    if(this.isNew){
        
    }
    if(!this.isNew){
        
    }
    */
});

// hash password
userSchema.pre("save", function (next){
    let user = this;
    if(!user.isModified("password")){
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password); 
        return next();
    }
});

// model methods 
userSchema.methods.authenticate = function (password) {
    let user = this;
    return bcrypt.compareSync(password,user.password);
};

// model & export
module.exports = User;