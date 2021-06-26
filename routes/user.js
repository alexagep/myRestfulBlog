const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const acc = require('../utils/acc')
const {isAuth} =  require('../middlewares/auth');




router.post('/forget-password', userController.handleForgetPassword);


router.post('/reset-password/:token', userController.handleResetPassword);


router.post('/createAdmin',isAuth, userController.createAdmin);


router.post('/allUsers',acc.userManagement, userController.allUsers);


router.post('/editUser', acc.editUser, (req, res) => {res.json(true)})


module.exports = router;