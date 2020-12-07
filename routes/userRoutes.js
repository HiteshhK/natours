const express = require('express');
const {
   signup,
   login,
   forgotPassword,
   protect,
   updatePassword,
   resetPassword,
   restrictedTo
} = require('../controllers/authController');
const {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    updateMe,
    deleteMe,
    getMe
} = require('../controllers/userController');

const router = express.Router();

//to only send/post the data
router.post('/signup',signup);
router.post('/login',login);

router.post('/forgotPassword',forgotPassword);
router.patch('/resetPassword/:token',resetPassword);

router.use(protect);
router.patch('/updateMyPassword/',updatePassword);
router.get('/me',getMe,getUser);
router.patch('/updateMe',updateMe);
router.delete('/deleteMe',deleteMe);

//only admin users should be able to perform below operations
router.use(restrictedTo('admin'));
router
   .route('/')
   .get(getAllUsers)
   .post(createUser);
router
   .route('/:id')
   .get(getUser)
   .patch(updateUser)
   .delete(deleteUser);

 module.exports = router;
