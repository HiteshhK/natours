const User = require('../Models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj,...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
}
exports.createUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'The route is not defined!Please use /signup instead!'
    })
}

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
}
exports.updateMe = catchAsync(async(req,res,next)=>{
    //1) create error if user post password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update, please use updateMyPassword',400))
    }

    //2) Filtered out unwanted fields name that are not allowed to be updated
    const filterBody = filterObj(req.body,'name','email'); 
    
    //3) update user documents
    const updateUser = await User.findByIdAndUpdate(req.user.id,filterBody,{
         new:true,
         runValidators:true
     });
    res.status(200).json({
        status:'success',
        data:{
            user:updateUser
        }
    })
});

exports.deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});

    res.status(204).json({
        status:'success',
        data:null
    })
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//Do Not update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);