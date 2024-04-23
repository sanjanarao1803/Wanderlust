const express=require("express");
const app=express();
const mongoose=require("mongoose");
//setting ejs
const path=require("path");
//put,delete from post
const methodOverride = require("method-override");
//ejs-mate
const ejsMate = require("ejs-mate");
//ExpressError
const ExpressError = require("./utils/ExpressError.js");
//session
const session = require("express-session");
//flash
const flash = require("connect-flash");

//express router
const listings=require("./routes/listing.js");
const reviews=require("./routes/reviews.js");

//connecting with wanderlust db
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
main()
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL);
}

//setting ejs
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
//parsing
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
//ejs-mate
app.engine('ejs',ejsMate);
//static file - public folder
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions = {
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized : true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};
app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

//basic route
app.get("/",(req,res)=>{
    res.send("Hi, I am root");
});

//express router
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

//ERROR HANDLING
//page not found error
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

//ExpressError handling
app.use((err,req,res,next) => {
    let {statusCode=500,message="Something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});

//starting server
app.listen(8080,()=>{
    console.log(`app listening at port 8080`);
});