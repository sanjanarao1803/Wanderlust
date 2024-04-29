const express = require("express");
const router = express.Router({mergeParams:true});

const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");  

const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");


//POST ROUTE
// "/listings/:id/reviews is common part , so we can remove it"
router.post("/" ,isLoggedIn ,validateReview, wrapAsync(reviewController.createReview));

//DELETE ROUTE
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
    
);

module.exports=router;