import { model, Schema } from "mongoose";
import { type } from "os";

const postSchema = new Schema({
    username:String,
    imgUrl:String,
    caption:String,
    likeCount:{default:0,type:Number},
    likedBy:[{username:String}]
})

const Posts = new model("Posts",postSchema);
export default Posts;