const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
const validator  = require('validator');
//mongoose scheema
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have a name!'],
        unique:true,
        trim:true,
        minlength:[10,'A Tour name must have more or equal to 10 characters!'],
        maxlength:[40,'A Tour name must have more or equal to 40 characters!'],
        // validate:[validator.isAlpha,'a tour name should contains characters only, even spaces are not allowed']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'A Tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A Tour must have a Group size']
    },
    difficulty:{
        type:String,
        required:[true,'A Tour must have a difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Difficulty should be easy,medium or difficult only'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1.0'],
        max:[5,'Rating must be below 5.0'],
        set: val=> Math.round(val * 10) / 10//4.6666,46.6666,47,4.7
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price!']
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                //this only points to current doc on NEW document creation
                return val < this.price;  
            },
            message:'Discount price {{VALUE}} should be below regular price '
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A Tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        trim:true,
        required:[true,'A tour must have a cover image']
    },
    images:[String],//array of images
    createdAt:{
        type:Date,
        default: Date.now(),
        select:false//hide this field in json response
    },
    startDates:[Date],//array of Dates
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        //GeoJSON
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    guides:[
        {
         type:mongoose.Schema.ObjectId,
         ref:'User'
        }
    ]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

// tourSchema.index({price:1});//1 means sorting in accending, -1 for decending
tourSchema.index({price:1,ratingsAverage:-1});//1 means sorting in accending, -1 for decending
tourSchema.index({slug:1});//1 means sorting in accending, -1 for decending
tourSchema.index({startLocation:'2dsphere'});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
  });
  
  // Virtual populate
  tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
  });

//DOCUMENT MIDDLEWARE: RUNS BEFORE .save() and .create()
tourSchema.pre('save',function(next){
 this.slug = slugify(this.name,{lower:true});
    // console.log(this);

    next();
})

//QUERY MIDDLEWARE:
tourSchema.pre(/^find/,function(next){
    // tourSchema.pre('find',function(next){
    this.find({secretTour:{$ne:true}})
    this['start'] = Date.now();
    next();
});

//middleware to populate guides(user )full information, not only id
tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'//only show guides withoud __V and passwordChangedAtField
    }).populate({
        path: 'reviews',
       select: '-__v',
       });
    next();
});

tourSchema.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now() - this['start']} milliseconds!`);
    // console.log(docs);
    next();
});



//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
//     console.log(this.pipeline());
//     next();
// })
//model
//use uppercase ex:Tour
const Tour = mongoose.model('Tour',tourSchema);

// //instance of Tour model, having some methods
// const testTour = new Tour({
//     name:'The Park Camper',
//     price:997
// });

// //saving data to db
// testTour.save().then(doc=>{
//     console.log(doc);
// }).catch(err=>{
//     console.log('ERRor: 💥',err);
// })

module.exports = Tour;