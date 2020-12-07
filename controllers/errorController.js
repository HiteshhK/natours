const AppError = require('./../utils/appError');
const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message,400);
}

const handleDuplicateFieldDB = err=>{
    // const value= err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    
    // const message = `Duplicate Field Value ${value}. Please use another value.`
    const message = `Duplicate Field Value name. Please use another value.`
    return new AppError(message,400);
};

const handleValidationError =  err =>{
    const errors = Object.values(err.errors).map(el=>el.message);
    const message = `Invalid input data ${errors.join('. ')}`;
    return new AppError(message,400);
}

const handleJWTError = err=> new AppError('Invalid Token, Please login Again',401);
const handleJWTExpired = err => new AppError('Youe Token has expired.Please login Again',401);
const sendErrorDev= (err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        stack:err.stack,
        error:err
    })
}

const sendErrorProd = (err,res)=>{
    //Operational. truested error: send message(details) to client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        })
    }
    //Programming or other unknown error: don't leak error details
    else{
        //1 Log Error
        console.log('Error 💥', err);
        //Send a generic message
        res.status(500).json({
            status:'error',
            message:'Something went wrong!'
        })
    }
}
module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    
    if(process.env.NODE_ENV==='development'){
        sendErrorDev(err,res);
    }
    else if(process.env.NODE_ENV==='production'){
        let error = { ...err }
        // console.log('errr-type----',err);
        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(err.code === 11000) error = handleDuplicateFieldDB(error);
        if(err.name === 'ValidationError') error = handleValidationError(error);
        if(err.name === 'JsonWebTokenError') error = handleJWTError(error)      
        if(err.name === 'TokenExpiredError') error = handleJWTExpired(error)      
        
        
        sendErrorProd(error,res);
    }
    
 }