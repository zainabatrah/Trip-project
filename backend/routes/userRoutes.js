const express = require("express");

const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
} = require("../controllers/userController");


router.put(
    "/change-password/:id",
    changePassword
);


router.get(
    "/profile/:id",
    getProfile
);


const upload = require("../middleware/upload");


router.put(
    "/profile/:id",
    upload.single("profileImage"),
    updateProfile
);
router.delete(
"/:id",
deleteAccount
);


module.exports=router;