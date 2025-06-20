import express from "express";
import { addFriend, addPost, displayPost, friendPosts, like, myPost, removeFriend, removePost } from "../controllers/user.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// router.post('/like',like);

router.post('/addPost',upload.single("postPhoto"),addPost)
router.post('/removePost',removePost)

router.post('/addFriend',addFriend)
router.post('/removeFriend',removeFriend)

router.post('/myPost',myPost);
router.post('/displayPost',friendPosts);


export default router;