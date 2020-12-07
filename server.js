const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});

//handling uncaught exceptions/declaration/undefined errors
process.on('uncaughtException',err=>{
    console.log('uncaught exception! 💥 Shutting down');
    console.log(err.name,err.message);
        process.exit(1);
});

const app = require('./app');
const mongoose = require('mongoose');

// const DB = process.env.DATABASE.replace(
//     '<PASSWORD>',
//     process.env.DATABASE_PASSWORD
// );
const DB = process.env.DATABASE;

mongoose
// .connect(process.env.DATABASE_LOCAL,{ //local db
    .connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(con=>console.log('DB Connection successfull'))


//reading config.env with package dotenv
//environment variables
// console.log(app.get('env'));

// console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port,()=>{
    console.log(`App running on port ${port}...`);
});

//catch unhandled exceptions here and close the app
process.on('unhandledRejection',err=>{
    console.log('Unhandled rejection! 💥 Shutting down');
    console.log(err);
    server.close(()=>{//let server finish processing request then close it
        process.exit(1);
    });
});



// console.log(x);