const express = require('express');
const router = express.Router()
const { isAuth } = require('../middlewares/auth');
const adminController = require('../controllers/adminController')




//Dashboard/ Handle Post Creation
router.post('/addPost', isAuth , adminController.postAddPost)

//Dashboard/ Handle Post Edit
router.put('/editPost/:id', isAuth , adminController.PostEditPost)

//Dashboard/ Delete Post
router.delete('/deletePost/:id', isAuth , adminController.getDeletePost)

//Dashboard/ Handle Image Upload
router.post('/uploadImage', isAuth , adminController.uploadImage)



module.exports = router