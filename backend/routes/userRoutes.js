const express = require("express");
const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
} = require("../controllers/userController");


router.put(
    "/change-password/:id",
    requireAuth,
    changePassword
);


router.get(
    "/profile/:id",
    requireAuth,
    getProfile
);


const upload = require("../middleware/upload");


router.put(
    "/profile/:id",
    requireAuth,
    upload.single("profileImage"),
    updateProfile
);
router.delete(
"/:id",
requireAuth,
deleteAccount
);


module.exports=router;
