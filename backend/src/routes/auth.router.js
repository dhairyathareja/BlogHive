import { loginController, signUpController } from "../controllers/auth.controller.js";
import express from "express";
const Router = express.Router();

Router.post('/signup',signUpController);
Router.post('/login',loginController);

export default Router;