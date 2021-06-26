//const jwt = require('jsonwebtoken');


exports.isAuth = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    
    res.status(401).json({message: 'you are not authorized'})
}


//JWT Authentication
/*
exports.isAuth = (req, res, next) => {
    const authHeader = req.get('authorization');

    try{
        if(!authHeader){
        const error = new Error('you are not allowed to access');
        error.statusCode = 422;
        throw error;
    }
    const token = authHeader.split(" ")[1]; //Bearer Token => ['Bearer','Token']

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if(!decodedToken){
        const error = new Error('you are not allowed to access');
        error.statusCode = 422;
        throw error;
    }

    req.userId = decodedToken.user.userId;
    next();
    }catch(err){
        next(err)
    }
}
*/