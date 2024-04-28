const express = require("express");
const router = express.Router({mergeParams:true});

const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");  

const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");




//POST ROUTE
// "/listings/:id/reviews is common part , so we can remove it"
router.post("/" ,isLoggedIn ,validateReview, wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    // console.log(newReview);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","New review created!");
    res.redirect(`/listings/${listing._id}`);

}));

//DELETE ROUTE
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(async(req,res) => {
        let {id,reviewId} = req.params;
        await Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","Review deleted!");
        res.redirect(`/listings/${id}`);
    })
    
);

module.exports=router;