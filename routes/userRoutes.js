import express from "express"
import singleUpload  from "../middlewares/multer.js"
import { changePassword, deleteMyProfile,getMyProfile, login, logout, register, updateProfile, updateProfilePicture, upload } from "../controllers/userController.js";
import { isAutheticated } from "../middlewares/auth.js";
const router= express.Router({});

router.route('/register').post(singleUpload,register); // To Register User
router.route('/login').post(login); // To login User
router.route('/logout').get(logout); // To logout User
router.route('/me').get(isAutheticated,getMyProfile); // To Get my Profile
router.route('/me').delete(isAutheticated,deleteMyProfile); // To Delete my Profile
router.route('/changepassword').put(isAutheticated,changePassword); // To changePassword
router.route('/updateprofile').put(isAutheticated,updateProfile); // To update profile
router.route('/updateprofilepicture').put(isAutheticated,singleUpload,updateProfilePicture); // To update profile
router.route('/upload').put(isAutheticated,singleUpload,upload); // To update profile

export default router