const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

router.use('/',viewController.getOverview);
router.use('/tour',viewController.getTour);

module.exports = router;