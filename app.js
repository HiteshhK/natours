const path = require('path');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const viewRouter = require('./routes/viewRoutes');
const cors = require('cors');
const app = express();
app.set('view engine','pug');

app.set('views',path.join(__dirname,'views')); 

//serving static file
//to allow static file in browser/like html files direct access for overview.html/other png files etc
app.use(express.static(path.join(__dirname,'public')));

// const path = require('path');
const AppError = require('./utils/appError');
const toursRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const globalErrorHandler = require('./controllers/errorController');

const reviewRouter = require('./routes/reviewRoutes');
//1)Global middlewares
//Set  Security HTTP Header
// app.use(helmet())
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'http:', 'data:'],
        scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
    })
  );

//Development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
    // var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
    // setup the logger
    // app.use(morgan('combined', { stream: accessLogStream }))
}

//Limit requests from same API
const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too Many requests from this IP, Please try again in an hour!'
});
//adding rate limiter in our app middleware for all routes with /api
app.use('/api',limiter);

//access origin
// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     res.setHeader('Access-Control-Allow-Methods','POST, GET, OPTIONS, DELETE, PUT');
//     res.setHeader('Access-Control-Allow-Headers','append,delete,entries,foreach,get,has,keys,set,values,Authorization');
//     next();
// });
app.use(cors({origin:true,credentials: true}));

//will add the data from body to req object
//or, Body Parser, reading data from body into req.body
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//cookie parser
app.use(cookieParser());

//Data sanitization against NoSql query injection
//this will look at the request body, query strings and request params and it will filter out all $ signs and symbols
app.use(mongoSanitize());
//Data sanitization against XSS
//it will prevent any html symbols or any element
app.use(xss());

//prevent parameter pollution
app.use(hpp({
    whitelist:[
        'duration',
        'ratingsAverage',
        'ratingsQuantity',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

//our middleware || Test middleware
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})
//3)Routes
//mounting a router

app.use('/',viewRouter);
app.use('/api/v1/tours',toursRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);

/**
 * should be at the end, after checking above routed
 * other routes than defined above
 */
app.all('**',(req,res,next)=>{
 
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;
    
    next(new AppError(new Error(`Can't find ${req.originalUrl} on this server`,404)));//what ever we pass in next, it is assumed as error, which will directly go to error handling middleware
});



//error handling middleware
//if we pass 4 argument in app.use express consider it as erro handling middleware
app.use(globalErrorHandler);
//4)Start server
module.exports = app;
//now open server.js