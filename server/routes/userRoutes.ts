import express from "express"
import { getThumbnailById, getUsersThumbail } from "../controllers/userController.js"
import protect from "../middlewares/auth.js";


const userRouter = express.Router()

userRouter.get('/thumbnails', protect, getUsersThumbail)
userRouter.get('/thumbnails/:id', protect, getThumbnailById)

// Backward-compatible aliases for the earlier misspelled route.
userRouter.get('/thumnails', protect, getUsersThumbail)
userRouter.get('/thumnails/:id', protect, getThumbnailById)

export default userRouter
