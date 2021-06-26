const Yup = require('yup');
const captchapng = require('captchapng');
const Blog = require('../models/Blog');
const { sendEmail } = require('../utils/mailer');
const Comment = require('../models/comments');

let CAPTCHA_NUM;


exports.getIndex = async(req, res, next) => {
    try{
        const numberOfPosts = await Blog.find({
            status: "public"
        }).countDocuments();


        const posts = await Blog.find({ status: "public" })
        
            .sort({ createdAt: 'desc'})
            .populate("user").exec();
        
        if(!posts){
            const error = new Error("not found any post")
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({posts, total: numberOfPosts})
    } catch(err){
        next(err)
    }
}


exports.getSinglePost = async(req, res, next) => {
    try{
        const post = await Blog.findOne({_id: req.params.id}).populate("user");      

        if(!post){
            const error = new Error('not found any post')
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({post})
    } catch (err) {
        next(err)
    }
}



exports.handleContactPage = async(req, res, next) => {
    const errorArr = [];

    const { firstName, email, message } = req.body;

    const schema = Yup.object().shape({
        firstName: Yup.string().required("Name is required"),
        email: Yup.string().email("Email Address is not correct").required('email address is required'),
        message: Yup.string().required("Write your message please!")
    });

    try{
        await schema.validate(req.body, {abortEarly: false});

            sendEmail(
                email, 
                firstName, 
                'message from FundMan', 
                `${message} <br/> User Email: ${email}`
            );

            res.status(200).json({message: "your message has been sent"})
    }catch(err){
        err.inner.forEach((e)=> {
            errorArr.push({
                name: e.path,
                message: e.message
            });
        });
        
        const error = new Error('Authentication Error');
        error.statusCode = 422;
        error.data = errorArr;

        next(error);
    }
}


exports.getCaptcha = (req, res) => {
    CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);

    const p = new captchapng(80, 30, CAPTCHA_NUM);

    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);

    const img = p.getBase64();
    const imgBase64 = Buffer.from(img, "base64");

    res.send(imgBase64);
};
