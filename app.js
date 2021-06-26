const express = require('express');
const path = require('path');
const config = require('./config/config');
const session = require('express-session');
const connectDB = require('./config/db');
const passport = require('passport');
const dotEnv = require("dotenv");
const cookieParser = require('cookie-parser');
const MongoStore = require("connect-mongo");
const fileUpload = require('express-fileupload');
const { errorHandler } = require('./middlewares/errors')
const { setHeaders } = require('./middlewares/hearders')
const app = express();
const api = require('./routes/api.js');



// Load Config
dotEnv.config({ path: "./config/config.env" });

//Database connection
connectDB();


//Body Parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(setHeaders);


//static folder
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//File Upload Middleware
app.use(fileUpload());


//session
app.use(session({
    key: 'user_sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/myOwnBlog' }),
}));


//* Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);


app.use('/', api);
app.use("/dashboard", require("./routes/dashboard"));
app.use('/home', require("./routes/blog"))
app.use('/users', require("./routes/user"))

// Error Controller
app.use(errorHandler)


const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
);