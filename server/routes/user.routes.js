import { Router } from "express";
import { deleteUser, login, logout, register } from "../controllers/user.controllers.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

userRouter.route('/register').post(register)
userRouter.route('/login').post(login)
userRouter.route('/logout').post(logout)
userRouter.route('/delete').delete(authenticateUser, deleteUser)

export default userRouter