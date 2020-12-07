const express = require('express');
const {
    createTour,
    deleteTour,
    getTour,
    updateTour,
    getAllTours,
    checkID,checkBody,
   aliasTopTours,
   getTourStats,
   getMonthlyPlan,
   getToursWithin,getDistances}
 = require('../controllers/tourController');
 const {protect,restrictedTo} = require('../controllers/authController');
const router = express.Router();
const reviewRouter = require('../routes/reviewRoutes');

//middleware
// router.param('id',checkID);

router.use('/:tourId/reviews',reviewRouter);

router
   .route('/top-5-cheap')
   .get(aliasTopTours,getAllTours);

router
   .route('/tourStats')
   .get(getTourStats);

router
   .route('/monthly-plan/:year')
   .get(
      protect,
      restrictedTo('admin','lead-guide','guide'),
      getMonthlyPlan
   );

router.route(
   '/tours-within/:distance/center/:latlng/unit/:unit')
   .get(getToursWithin);
// /tours-distance?distance=233&center=-45,46&unit=mi
// /tours-distance/233/center/-45,46/unit/mi
router.route(
   '/distances/:latlng/unit/:unit')
   .get(getDistances)
router
   .route('/')
   .get(getAllTours)
   .post(
      protect,
      restrictedTo('admin','lead-guide'),
      createTour
   );
   // .post(checkBody,createTour);
router
 .route('/:id')
 .get(getTour)
 .patch(
      protect,
      restrictedTo('admin','lead-guide'), 
      updateTour
   )
 .delete(
      protect,
      restrictedTo('admin','lead-guide'),
      deleteTour
   );

    

module.exports = router;