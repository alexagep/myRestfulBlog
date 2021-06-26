const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const blogController = require('../controllers/blogController');


router.post('/contact', blogController.handleContactPage); 

router.get('/captcha.png', blogController.getCaptcha); 

router.post('/login', userController.login_post)

router.post('/register', userController.register_post)
 


module.exports= router;