const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
     return next(new AppError('No Document Found with that ID',404))    
  } 
    res.status(204).json({
         status:'success',
         tour:null
     })
});

exports.updateOne = Model => catchAsync( async (req,res,next)=>{
    const doc  = await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,//return an updated document
        runValidators:true//should validate the updated field
    });

    if(!doc){
        return next(new AppError('No Document Found with that ID',404))    
     }
    res.status(200).json({
        status:'success',
        data:doc
    });    
});

exports.createOne = Model => catchAsync(async (req,res,next)=>{
    //Tour.create() returns a promise so we are using async await 
    //which returns then result of promise
    const doc = await Model.create(req.body);
    res.status(201).json({
        status:'success',
        data:{
            data:doc
        }
    });
});

exports.getOne = (Model,popOptions) => catchAsync( async (req,res,next)=>{
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    const doc = await query;
    if(!doc){
       return next(new AppError('No document Found with that ID',404))    
    }
    res.status(200).json({
      status:'success',
        // results:docs.length,
        data:{
            doc
        }
    });
});

exports.getAll = Model => catchAsync(async (req,res,next)=>{
    
    //To allow for nested get Reviews on tour
    let filter = {};
    if(req.params.tourId) filter = {tour:req.params.tourId};
    const features = new APIFeatures(Model.find(filter),req.query).filter()
                    .sort()
                    .limitFields()
                    .paginate();
    //EXECUTE THE QUERY
    const doc = await features.query;

    res.status(200).json({
        status:'success',
        requestedAt:req.requestTime,
        results:doc.length,
        data:{
           data: doc
        }
    });
});