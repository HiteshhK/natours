// const fs = require('fs');
/**
 * JSend format :{status:'',data{}}
 * all calclulation for add,read,update,delete of tours
 * then these methods called from toursRoutes.js
 */
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const { query } = require('express');
const Tour = require('../Models/tourModel');
const catchAsync = require('./../utils/catchAsync'); 
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
// exports.checkID = (req,res,next,val)=>{
//     if(req.params.id * 1 > tours.length){
//         return res.status(404).json({
//             status:'fail',
//             message:'Invalid ID'
//         })
//     }
//     next();
// }

// exports.checkBody = (req,res,next)=>{
//     console.log('req.body-----',req.body);
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status:'fail',
//             message:'Missing name or price'
//         });
//     }
//     next();
// }

exports.aliasTopTours = (req,res,next)=>{
       req.query.limit = '5';
       req.query.sort = '-ratingsAverage,price';
       req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
       next();
}

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour,{path:'reviews'});

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req,res,next)=>{
//        const tour = await Tour.findByIdAndDelete(req.params.id);
//        if(!tour){
//         return next(new AppError('No Tour Found with that ID',404))    
//      } 
//        res.status(204).json({
//             status:'success',
//             tour:null
//         })
// });

exports.getTourStats= catchAsync (async (req,res,next)=>{
        const stats = await Tour.aggregate([
            {
                $match:{ratingsAverage:{$gte:4.5}}
            },
            {
                $group:{
                    // _id:'$ratingsAverage',//group using ratingsAverage
                    _id:{$toUpper:'$difficulty'},//group using difficulty
                    numCounter:{$sum:1},//add for each tour
                    numRatings:{$sum:'$ratingsQuantity'},//add total ratings 
                    avgRating:{$avg:'$ratingsAverage'},//get average of all ratings
                    avgPrice:{$avg:'$price'},//avg tour price
                    minPrice:{$min:'$price'},//minimum tour price
                    maxPrice:{$max:'$price'}//max tour price
                }
            },
            {
                //use the fields name used in $groupObject
                $sort:{ avgPrice:1}
            }
            // {
            //     //we can also repeat the operator
            //     $match:{_id:{ $ne: 'EASY'}}//remove item with id as EASY
            // }
        ]);

        res.status(200).json({
            status:'success',
            data:{
                stats
            }
        });
})

exports.getMonthlyPlan = catchAsync(async (req,res,next)=>{
        const year = req.params.year * 1;//2021 passing

        const plan = await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{//match all tours in that year, from jan 1 ro dec 31
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group:{//group by them in months
                    _id:{$month:'$startDates'},
                    numTourStart:{$sum:1},
                    tours:{$push:'$name'}
                }
            },
            {
                $addFields:{month:'$_id'} 
            },
            {
                $project:{
                    _id:0//to hide the id, 1 to show
                }
            },
            {
                $sort:{numTourStart:-1}//decending order 
            },
            {
                $limit:3
            }
        ]);
        res.status(200).json({
            status:'success',
            data:{
                plan
            }
        });
});

// /tours-distance?distance=233&center=-45,46&unit=mi
 // /tours-distance/233/center/-45,46/unit/mi

exports.getToursWithin = catchAsync(async(req,res,next)=>{
    const { distance ,latlng, unit} = req.params;
    const[lat,lng] = latlng.split(',');

    //conveting distance in raians
    const radius = unit==='mi'?distance/3963.2:distance/6378.1;

    if(!lat || !lng)
    next(
        new AppError(
            'Please provide latitude and longtitude in the format lat,lng',
            400
        )
    );

    console.log({distance,lat,lng,unit});
    const tours = await Tour.find({
         startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
    });
    res.status(200).json({
        status:'success',
        results:tours.length,
        data:{
            data:tours
        }
    });
});

exports.getDistances = catchAsync(async(req,res,next)=>{
    const {latlng, unit} = req.params;
    const[lat,lng] = latlng.split(',');
    const multiplier = unit ==='mi'?0.000621371:0.001;
    if(!lat || !lng)
    next(
        new AppError(
            'Please provide latitude and longtitude in the format lat,lng',
            400
        )
    );
    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[lng*1,lat*1]
                },
                distanceField:'distance',
                distanceMultiplier :multiplier
            }
        },
        {
            $project:{
             distance:1,
             name:1
            }
        }
    ]);
    res.status(200).json({
        status:'success',
        data:{
            data:distances
        }
    });
});