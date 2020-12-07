module.exports = fn=>{//will return a new function will call fn which handles everything 
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    };
}