const express=require("express");
const app=express();
const mongoose=require("mongoose");

//ejs-mate
const ejsMate = require("ejs-mate");

const Listing = require("./models/listing.js"); //requiring listing collection

//review
const Review = require("./models/review.js");

//wrapAsync
const wrapAsync = require("./utils/wrapAsync.js");
//ExpressError
const ExpressError = require("./utils/ExpressError.js");

//setting ejs
const path=require("path");
//parsing
app.use(express.urlencoded({extended:true}));

//put,delete from post
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//ejs-mate
app.engine('ejs',ejsMate);

//static file - public folder
app.use(express.static(path.join(__dirname,"/public")));

//joi validate schema
const {listingSchema , reviewSchema} = require("./schema.js");

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

//joi middleware
const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else{
        next();
    }
}

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else{
        next();
    }
}

//index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));



//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//create route
// app.post("/listings",async (req,res)=>{
//     let listing=req.body.listing;
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
// });
//with error handling
// app.post("/listings",async (req,res,next)=>{
//     try{
//         // let listing=req.body.listing;
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");    
//     }catch(err){
//         next(err);
//     }
// });
//wrapAsync error handling
app.post(
    "/listings",
    validateListing,
    wrapAsync(async (req,res,next)=>{
        //try using hoppscotch.io and send null data
        // if(!req.body.listing){
        //     throw new ExpressError(400,"Send valid data for listing");
        // }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings"); 
    })   
);


//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//update route
app.put(
    "/listings/:id", 
    validateListing,
    wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    // console.log("sa");
    // res.redirect("/listings");
    res.redirect(`/listings/${id}`);
}));

//edit route
app.get("/listings/:id/edit", wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));



//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//REVIEWS
//POST ROUTE
app.post("/listings/:id/reviews" , validateReview, wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);

}));

//delete route
app.delete(
    "/listings/:id/reviews/:reviewId",
    wrapAsync(async(req,res) => {
        let {id,reviewId} = req.params;
        await Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    })
    
);

//basic route
app.get("/",(req,res)=>{
    res.send("Hi, I am root");
});

//testing route

// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

//page not found error
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

//error handling
// app.use((err,req,res,next) => {
//     res.send("Something went wrong!");
// });
//ExpressError handling
app.use((err,req,res,next) => {
    let {statusCode=500,message="Something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log(`app listening at port 8080`);
});
