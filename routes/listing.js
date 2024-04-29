const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");  //requiring listing collection
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer  = require('multer')

const {storage} = require("../cloudConfig.js");
const upload = multer({storage });

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)   
    );
    // .post(upload.single('listing[image]'),(req,res)=>{
    //     res.send(req.file);
    // });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//new route
//this route should be above "/:id" as new will be taken as id when req sent to "/new"
router.get("/new", isLoggedIn,listingController.renderNewForm);


router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))
    .put( 
        isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing)
    );
    
//edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;

//index route
// router.get("/", wrapAsync(listingController.index));
//create route
// router.post(
//     "/",
//     isLoggedIn,
//     validateListing,
//     wrapAsync(listingController.createListing)   
// );


//show route
// router.get("/:id",wrapAsync(listingController.showListing));
//delete route
// router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));
//update route
// router.put(
//     "/:id", 
//     isLoggedIn,
//     isOwner,
//     validateListing,
//     wrapAsync(listingController.updateListing));



