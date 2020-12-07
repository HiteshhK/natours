const mongoose = require('mongoose');
const Tour = require('../Models/tourModel');
const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required:[true,'Review can not be Empty'],
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour.']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must belong to a User.']
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//user can not review multiple times
reviewSchema.index({ tour: 1, user: 1 },{ unique: true });
// Query Middleware
reviewSchema.pre(/^find/,function(next){
    //middleware to populate user,tour full information, not only id
    
    this.populate({
        path:'user',
        select:'name photo'//only show guides withoud __V and passwordChangedAtField
    })
    // .populate({
    //     path:'tour',
    //     select:'name'
    // })
    next();
})

reviewSchema.statics.calcAverageRatings = async function(tourId){
	const stats = await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ]);
    let updateData={
        ratingsQuantity:0,
        ratingsAverage:4.5
    }
    if(stats.length > 0){
        updateData.ratingsQuantity = stats[0].nRating;
        updateData.ratingsAverage = stats[0].avgRating;
    }
    await Tour.findByIdAndUpdate(tourId,updateData);
};

reviewSchema.post('save',function(){
    //this points to current review
    this.constructor.calcAverageRatings(this.tour);

});

reviewSchema.pre(/^findOneAnd/,async function(next){
    //creating r on this to get the data in post query middleware below
    //getting current document
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/,async function(){
    //await this.findOne() doesnot work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;