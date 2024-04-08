const express=require("express");
const app=express();
const mongoose=require("mongoose");

//ejs-mate
const ejsMate = require("ejs-mate");

const Listing = require("./models/listing.js"); //requiring listing collection

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

//index route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});



//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//create route
app.post("/listings",async (req,res)=>{
    let listing=req.body.listing;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//delete route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

//update route
app.put("/listings/:id", async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    // console.log("sa");
    // res.redirect("/listings");
    res.redirect(`/listings/${id}`);
});

//edit route
app.get("/listings/:id/edit", async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});



//show route
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

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


app.listen(8080,()=>{
    console.log(`app listening at port 8080`);
});