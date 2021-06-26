const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController')

//desc: Weblog index page
router.get('/', blogController.getIndex);

//Weblog Post Page
router.get("/post/:id", blogController.getSinglePost);




module.exports = router;