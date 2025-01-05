import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { registerValidation, loginValidation, postCreateValidation } from "./validations.js"

import { UserController, PostController } from "./controllers/index.js" 
import { checkAuth, handleValidationErrors } from './utils/index.js'

mongoose.connect('mongodb+srv://sasha:11111@cluster0.igcum.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('DB Ok'))
.catch((err) => console.log('DB error', err))

const app = express()
app.use('/uploads', express.static('uploads'))
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads')
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

app.use(express.json())

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
app.get('/auth/me', checkAuth, UserController.getMe)

app.get('/posts', PostController.getAll)
app.get('/posts/:id', PostController.getOne)
app.post('/posts', checkAuth, postCreateValidation, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, PostController.update)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})

app.listen(4444, (err) => {
  if (err) {
    return console.log(err)
  }
  console.log('Server OK')
})