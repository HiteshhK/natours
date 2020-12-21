const express = require('express');
const {
   signup,
   login,
   logout,
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
    getMe,
    uploadPhoto,
    resizeUserPhoto
} = require('../controllers/userController');


const router = express.Router();

//to only send/post the data
router.post('/signup',signup);
router.post('/login',login);
router.get('/logout',logout);

router.post('/forgotPassword',forgotPassword);
router.patch('/resetPassword/:token',resetPassword);


router.use(protect);
router.patch('/updateMyPassword/',updatePassword);
router.get('/me',getMe,getUser);
router.patch('/updateMe',uploadPhoto,resizeUserPhoto,updateMe);
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
