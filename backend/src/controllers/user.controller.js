import { resourceLimits } from "worker_threads";
import Posts from "../model/post.model.js";
import User from "../model/user.model.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const like=ErrorWrapper(async(req,res,next)=>{
    
    const{id,reqUsername}=req.body;
    
    try {

        let post = await Posts.findOne({_id:id});   
        
        if(post.likeCount>0){
            const likedList=[];    
            post.likedBy.forEach(item=>{likedList.push(item.username)});
            
            if(likedList.includes(reqUsername)){
                post.likeCount-=1;
                const updatedLikeArray=post.likedBy.filter(element=>element.username != reqUsername)
                post.likedBy=updatedLikeArray;
            }
            else{
                post.likeCount+=1;
                post.likedBy.unshift({username:reqUsername});
            }
        }
        else{
            post.likeCount+=1;
            post.likedBy.unshift({username:reqUsername})
        }
            
        await post.save();
        res.status(200).json({
            message:"Liked !!",
            post:post
        })
    } catch (error) {
        throw new ErrorHandler(404,`Error Found`);
    }
    
})

export const addPost = ErrorWrapper(async (req,res,next) => {
    
    const{username,caption}=req.body
    
    let newPost = await Posts.create({
        username,
        caption,
        imgUrl:req.file.path,
    })

    let post=await Posts.findOne({_id:newPost._id});
    
    res.status(200).json({
        message:"Post Added Successfully",
        post:post
    });

})

export const removePost = ErrorWrapper(async (req,res,next) => {
    const {id}=req.body;
    
    try {
        await Posts.deleteOne({_id:id});

        let checkPost= await Posts.findOne({_id:id});
        if(!checkPost){
            res.status(200).json({
                message:"Post Deleted Successfully"
            })
        }    
    } catch (error) {
        res.status(401).json({
            message:"Error in Deleteing Post"
        })    
    }
   
})

export const addFriend = ErrorWrapper(async (req,res,next) => {
    const {username,friendUsername}=req.body;
    let errMessage="Error in Adding Friend";
    try {
    
        const friendExist= await User.findOne({username:friendUsername});
        if(!friendExist){
            errMessage="User does not Exist";
            throw new ErrorHandler(401,"User does not Exist");
        }

        const user = await User.findOne({username:username});

        user.friends.forEach(element => {
            if(element.friendUsername==friendUsername){
                errMessage="Friend Already Added";
                throw new ErrorHandler(401,'Friend Already Exist')
            }
        });

        user.friends.unshift({friendUsername:friendUsername});
        
        await user.save();
        
        res.status(200).json({
            message:"Friend Added Successfully",
            user:user
        })
    } catch (error) {
        res.status(401).json({
            message:errMessage
        })
    }
     
})

export const removeFriend = ErrorWrapper(async (req,res,next) => {
    
    const{username,friendUsername} =req.body;
    try {
        const user=await User.findOne({username:username});
        const newFriends=user.friends.filter(element => element.friendUsername != friendUsername);
        user.friends=newFriends;
        await user.save();

        res.status(200).json({
            message:"Friend Removed Successfully",
            user:user
        })
    } catch (error) {
        res.status(401).json({message:"Error in Rmoving friend"})
    } 
})

export const displayPost= ErrorWrapper(async (req,res,next) => {
    
    try {
        const posts= await Posts.find();
        res.status(200).json({
            message:"Post Fetched Successfully",
            post:posts
        })
    } catch (error) {
        res.status(401).json({message:"Error in fetching posts"})
    }
})

export const myPost= ErrorWrapper(async (req,res,next) => {
    
    const{username}=req.body;

    try {
        const posts= await Posts.find();
        const myPost=posts.filter(element => element.username==username);
        res.status(200).json({
            message:"Post Fetched Successfully",
            post:myPost
        })
    } catch (error) {
        res.status(401).json({message:"Error in fetching your posts"})
    }
})

export const friendPosts= ErrorWrapper(async (req,res,next) => {
    const{friendsUsername}=req.body;

    try {
        
        const posts= await Posts.find();
        const friendPosts=[];
        const friendList=[];
        friendsUsername.forEach(element => {
            friendList.push(element.friendUsername);
        });
        posts.forEach(item=>{
            let author=item.username;
            if(friendList.includes(author)){
                friendPosts.push(item)
            }
        })
        res.status(200).json({
            message:"Post Fetched Successfully",
            post:friendPosts
        })
    } catch (error) {
        res.status(401).json({message:"Error in fetching posts"})
    }
})