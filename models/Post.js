const mongoose = require("mongoose");
const util  = require("../util");

// schema
const postSchema = mongoose.Schema({ 
    title:{type:String, required:[true,"Title is required!"]},
    body:{type:String, required:[true,"Body is required!"]},
    author:{type:mongoose.Schema.Types.ObjectId, ref:"user", required:true}, //FK설정
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
},{
    toObject:{virtuals:true} 
});

// virtuals은 실제 DB에 저장되진 않지만 model에서는 db에 있는 다른 항목들과 동일하게 사용
// virtuals Arrow Function 적용안됨
postSchema.virtual("createdDate").get(function() {
    return util.getDate(this.createdAt);
});

postSchema.virtual("createdTime").get(function() {
    return util.getTime(this.createdAt);
});

postSchema.virtual("updatedDate").get(function() {
    return util.getDate(this.updatedAt);
});

postSchema.virtual("updatedTime").get(function() {
    return util.getTime(this.updatedAt);
});

// model & export
const Post = mongoose.model("post", postSchema);
module.exports = Post;
