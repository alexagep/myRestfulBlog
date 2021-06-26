const User = require('../models/user')
const { sendEmail } = require("../utils/mailer");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');



//Login with Passport
// exports.login_post = (req, res, next) => {    
//     passport.authenticate("local", {
//         failureRedirect: "/login",
//         failureFlash: true,
//     })(req, res, next)
// };    


//Login With JWT
exports.login_post = async (req, res, next) => {
    const { password, email } = req.body;

    try {
        const user = await User.findOne({email})
        if(!user){
            const error = new Error('email or password is incorrect')
            error.statusCode = 404;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if(isEqual){
            const token = jwt.sign({user: {
                userId: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
        
        },
        process.env.JWT_SECRET,
       );
       res.status(200).json({token, userId: user._id.toString()});
    }else{
        const error = new Error('email or password is incorrect');
        error.statusCode = 422;
        throw error;
    }
    } catch (err) {
        next(err);
    }
}


exports.register_post = async(req, res, next) => {
    const { firstName, email } = req.body;

    try {
        if (!req.body.username || !req.body.email || !req.body.password || 
            !req.body.confirmPassword || !req.body.firstName ||
             !req.body.lastName || !req.body.gender || !req.body.mobile) {
    
            const error = new Error('Please enter all fields')
            error.statusCode = 422;
            throw error;
        };
    
        if (req.body.password != req.body.confirmPassword) {
            const error = new Error('passwords do not match')
            error.statusCode = 422;
            throw error;
          }
    
        const user = await User.findOne({email: req.body.email});
        const userSave = await User.findOne({username: req.body.username.trim()})
    
        if(user) {
    
            const error = new Error('Email already exists')
            error.statusCode = 422;
            throw error;
        } else if (userSave) {
    
            const error = new Error('username already exists')
            error.statusCode = 422;
            throw error;
        } else {
                let createdUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username.trim(),
                    password: req.body.password,
                    gender: req.body.gender,
                    mobile: req.body.mobile,
                    email: req.body.email
                })
                await createdUser.save();

                //send Welcome Email
                sendEmail(email, firstName, 'Welcome to FUNDMAN', 'we are so lucky to have you in our site')
                res.status(201).json({message: 'You Have Signed Up Successfully'})
            }
    } catch (err) {
        next(err)
    }
}


exports.handleForgetPassword = async(req, res, next) =>{
    const { email } = req.body;
    try {
        const user = await User.findOne({ email })

        if(!user){
            const error = new Error(`user with this email doesn't exists`)
            error.statusCode = 404;
            throw error;
        }

        const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        const resetLink = `http://localhost:3000/users/reset-password/${token}`;

        sendEmail(user.email, user.firstName, 'forget password', `for changing current password, click below link: 
            <br>    
            <a href="${resetLink}"> Reset Password's Link</a>
                `);

        res.status(200).json({message: 'link of changing password, with an email has been sent to you'})
    
    } catch (err) {
        next(err)
    }
}


exports.handleResetPassword = async(req, res, next) => {
    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    try {
        if(!decodedToken){
            const error = new Error('token is invalid');
            error.statusCode = 401;
            throw error;
        }

        if(password != confirmPassword){
            const error = new Error('passwords are not equal');
            error.statusCode = 422;
            throw error;
        }
    
        const user = await User.findOne({ _id: decodedToken.userId })
        
        if(!user){
            const error = new Error('user does not exist');
            error.statusCode = 404;
            throw error;
        }
    
        user.password = password;
        await user.save();
    
        res.status(200).json({message: "Your password has been updated successfully"})
    } catch (err) {
        next(err);
    }
    
}


exports.createAdmin = async (req, res, next) => {
    try {
        
        if (req.user.role != "admin"){ 
            res.status(403).json({msg: "Permission Denied!"})
            return
        }

        let admin = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: 'admin',
            gender: req.body.gender,
            mobile: req.body.mobile
        });

        admin = await admin.save();
        
        res.status(201).json({admin, message: 'admin successfully created'})
    } catch (err) {
        next(err)
    }
}


exports.allUsers = (req, res) => {

    User.find({role: {$ne: 'admin'}}, (err, users) => {
        if(err) return res.status(400).json({err, msg: "something went wrong"});
        res.status(200).json(users);
    })
}