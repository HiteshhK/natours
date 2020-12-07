const express = require('express');
const {
    getAllReviews,
    createReview,
    deleteReview, 
    updateReview,
    setTourUserIds,
    getReview
} = require('../controllers/reviewController');
const {protect,restrictedTo} = require('../controllers/authController');
const router = express.Router({mergeParams:true});

router.use(protect);
router
    .route('/')
    .get(getAllReviews)
    .post(
        restrictedTo('user'),
        setTourUserIds,
        createReview
    );

router
    .route('/:id')
    .get(getReview)
    .patch(restrictedTo('user','admin'),updateReview)
    .delete(restrictedTo('user','admin'),deleteReview);

module.exports = router;