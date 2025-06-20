import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from 'http';
import { Server as SocketIOServer } from "socket.io";

import { verifyJWT } from './middleware/verifyJWT.js';
import AuthRouter from './routes/auth.router.js';
import UserRouter from './routes/user.router.js';
import Posts from "./model/post.model.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4444;

app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:3000',
  credentials: true
}));

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ORIGIN || 'http://localhost:3000',
    credentials: true
  }
});

app.use(express.json());
app.use(bodyParser.json({ limit: '5KB' }));
app.use(bodyParser.urlencoded({ extended: true, limit: "5KB" }));
app.use(cookieParser());
// app.use(express.static('public'));


// Setup image folder
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirPath = path.join(__dirname, '../public/images');
app.use('/images', express.static(dirPath));

const buildPath = path.join(__dirname, '../public/build');
app.use(express.static(buildPath));


// Routers
app.use('/auth', AuthRouter);
app.use('/user', verifyJWT, UserRouter);

// Socket.IO handling
io.on('connection', (socket) => {
  // console.log('New client connected:', socket.id);

  socket.on('like_post', async ({ postId, reqUsername }) => {
    try {
      let post = await Posts.findById(postId);
      if (!post) return;

      const alreadyLiked = post.likedBy.some(user => user.username === reqUsername);

      if (alreadyLiked) {
        post.likeCount -= 1;
        post.likedBy = post.likedBy.filter(user => user.username !== reqUsername);
      } else {
        post.likeCount += 1;
        post.likedBy.unshift({ username: reqUsername });
      }

      await post.save();

      // Broadcast the updated like count to all clients
      io.emit('like_update', {
        postId: post._id,
        count: post.likeCount
      });

    } catch (error) {
      console.error('Error updating like:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server after DB connection
mongoose.connect(process.env.DBURI).then(() => {
  server.listen(PORT, () => {
    console.log(`Server Running at Port: ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
});
