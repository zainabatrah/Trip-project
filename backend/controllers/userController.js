const User = require("../models/User");
const bcrypt = require("bcryptjs");
const SocialPost = require("../models/SocialPost");
const SocialStory = require("../models/SocialStory");
const Friendship = require("../models/Friendship");

function canAccessOwnProfile(
    req
) {
    return String(req.user?._id || "") ===
        String(req.params.id || "");
}

// Get profile
exports.getProfile = async(req,res)=>{

    try{
        if(!canAccessOwnProfile(req)){
            return res.status(403).json({
                message:"You can only access your own profile"
            });
        }

        const user = await User.findById(req.params.id);

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }


        res.json(user);


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



// Update profile
exports.updateProfile = async(req,res)=>{

    try{
        if(!canAccessOwnProfile(req)){
            return res.status(403).json({
                message:"You can only update your own profile"
            });
        }


        const updateData = {

            fullName:req.body.fullName,

            bio:req.body.bio,

            country:req.body.country

        };


        if(req.file){

            updateData.profileImage =
            "/uploads/" + req.file.filename;

        }



        const user = await User.findByIdAndUpdate(

            req.params.id,

            updateData,

            {
                new:true
            }

        );


        res.json(user);



    }catch(error){

        console.log("UPDATE ERROR:",error);

        res.status(500).json({
            message:error.message
        });

    }

};

exports.deleteAccount = async(req,res)=>{

    if(!canAccessOwnProfile(req)){
        return res.status(403).json({
            message:"You can only delete your own account"
        });
    }

    await Promise.all([
        User.findByIdAndDelete(req.params.id),
        SocialPost.deleteMany({
            author:req.params.id
        }),
        SocialStory.deleteMany({
            author:req.params.id
        }),
        Friendship.deleteMany({
            $or:[
                {
                    requester:req.params.id
                },
                {
                    recipient:req.params.id
                }
            ]
        })
    ]);

    res.json({
        message:"Account deleted"
    });

};


exports.changePassword = async(req,res)=>{

    try{
        if(!canAccessOwnProfile(req)){
            return res.status(403).json({
                message:"You can only change your own password"
            });
        }

        const user = await User
            .findById(req.params.id)
            .select("+passwordHash");


        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }


        const isMatch = await bcrypt.compare(
            req.body.currentPassword,
            user.passwordHash
        );


        if(!isMatch){

            return res.status(400).json({
                message:"Current password is incorrect"
            });

        }


        const newPasswordHash = await bcrypt.hash(
            req.body.newPassword,
            10
        );


        user.passwordHash = newPasswordHash;


        await user.save();


        res.json({
            message:"Password changed successfully"
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};
