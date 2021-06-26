const Blog = require("../models/Blog");
const { storage, fileFilter } = require('../utils/multer')
const multer = require('multer');
const sharp = require("sharp");
const shortId = require('shortId');
const appRoot = require('app-root-path');
const fs = require('fs');



exports.PostEditPost = async(req, res, next) =>{

    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
    

    const post = await Blog.findOne({ _id: req.params.id })

    try {
        if(thumbnail.name){
            await Blog.postValidation({...req.body, thumbnail});
        }else {
            await Blog.postValidation({...req.body, thumbnail: {name: 'placeholder', size: 0, mimeType: 'image/jpeg' || 'image/jpg' || 'image/png'}})
        }
            

        if(!post) {
            const error = new Error('post not found')
            error.statusCode = 404;
            throw error;
        }

        if(post.user.toString() != req.userId){
            const error = new Error('you are not allowed to access this post')
            error.statusCode = 401;
            throw error;
        }else{
            if(thumbnail.name){
                fs.unlink(`${appRoot}/public/uploads/thumbnail/${post.thumbnail}`, async (err) => {
                    if(err) throw err;
                    else{
                        await sharp(thumbnail.data)
                            .toFile({uploadPath})
                            .catch((err) => console.log(err))
                    }
                })
            }

            const { title, status, body } = req.body;
            post.title = title;
            post.status = status;
            post.body = body;
            post.thumbnail = thumbnail.name ? fileName : post.thumbnail

            await post.save();
            return res.status(200).json({message: 'post has been edited successfully'})
        }
    } catch (err) {
        next(err)
    }
}

exports.postAddPost = async(req, res, next) => {

    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

    try {
        req.body = { ...req.body, thumbnail};

        await Blog.postValidation(req.body);
        await sharp(thumbnail.data)
            .toFile(uploadPath)
            .catch((err) => console.log(err));

        await Blog.create({...req.body, user: req.userId, thumbnail: fileName});

        res.status(201).json({message: "post has been added successfully"})
    } catch (err) {
        next(err)
    }
};

exports.getDeletePost= async(req, res, next) => {
    try {
        const post = await Blog.findByIdAndRemove(req.params.id);
        const filePath = `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`
        fs.unlink(filePath, (err) => {
            if(err){
                const error = new Error('removing thumbnail failed')
                error.statusCode = 401;
                throw error;
            }else{
                res.status(200).json({message: "post has been deleted successfully"})
            }
        });

    } catch (err) {
        next(err)
    }
}

exports.uploadImage = (req, res) => {
    const upload = multer({
        limits: {fileSize: 1000000},
        fileFilter,
        storage
    }).single('image');

    upload(req, res, async(err)=>{
        if(err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(422).json({message: "image size must be less than 1MB"});
            }
            res.status(400).json(err);
        }else {
            if(req.files){
                const fileName = `${shortId.generate()}_${req.files.image.name}`;
                await sharp(req.files.image.data)
                    .toFile(`./public/uploads/${fileName}`)
                    .catch((err) => console.log(err));

                res.status(200).json({image: `http://localhost:3000/uploads/${fileName}`});
            }else{
                res.status(400).json({message: "for uploading, you should choose an image first"})
            }
        }
    });
}