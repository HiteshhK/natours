const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator  = require('validator');
//name, email, photo, password,passwordconfirm

const userSchema = new mongoose.Schema({
    name:{
     type:String,
     required:[true,'A user must have a name'],
    //  trim:true,
    //  minlength:[5,'A User name must have more or equal to 5 characters'],   
    //  maxlength:[40,'A User name must have less or equal to 40 characters']   
    },
    email:{
        type:String,
        required:[true,'A user must have a email'],
        unique:true,
        validate:[validator.isEmail,'A user mail id should containes @, . fields'],
        lowercase:true
    },
    photo:String,
    role:{
        type:String,
        emum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:8,
        select:false
    },passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            //This only works on create and save!!
            validator:function(el){
                return el === this.password;
            },
            message:"Passwords are not the same!"
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});
//using a pre hook to encrypt the data before saving data
userSchema.pre('save', async function(next){
    //if the password has not been modified
    if(!this.isModified('password')) return next();

    //hash returns a promise
    //hash the password with the cost of 12
    this.password =await bcrypt.hash(this.password,12);//12 is the code use for hashing
    this.passwordConfirm = undefined;//do not save this to db,
    next();
})
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;//subtracting 1 sec in the time in case token creation take less time than this time
    next();
});

//query middleware, run before find query 
userSchema.pre(/^find/,function(next){
//this points to the current query
this.find({active:{$ne:false}});
next();
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    // this.password//will not be available as we put select:false 
    return await bcrypt.compare(candidatePassword,userPassword);   
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime()/1000,
            10
        );
        return JWTTimestamp < changedTimeStamp;//100< 200 after the token  issues//changes
    }

    //falase means NOT CHANGED
    return false;
}

userSchema.methods.createPasswordResetToken =  function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken =  crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
    console.log({resetToken},this.passwordResetToken);

    this.passwordResetExpires = Date.now()+10*60*1000;

    return resetToken;
}
const User = mongoose.model('User',userSchema);

module.exports = User;