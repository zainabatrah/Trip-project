import { useEffect, useState } from "react";
import api from "../services/api";
import "./Profile.css";


export default function Profile() {

    const [user, setUser] = useState(null);

    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
const [preview,setPreview]=useState(null);
const [imageFile,setImageFile] = useState(null);
    const [formData,setFormData] = useState({
        fullName:"",
        country:"",
        bio:"",
        profileImage:""
    });

const [passwordData,setPasswordData] = useState({
    currentPassword:"",
    newPassword:"",
    confirmPassword:""
});
const [showPassword,setShowPassword] = useState({
    current:false,
    new:false,
    confirm:false
});

const [message,setMessage] = useState("");
const [successMessage,setSuccessMessage] = useState("");
    useEffect(()=>{

        const savedUser = JSON.parse(
            localStorage.getItem("tripUser")
        );


        if(savedUser){

            api.get(`/users/profile/${savedUser._id}`)
            .then(res=>{

                setUser(res.data);

                setFormData({
                    fullName:res.data.fullName || "",
                    country:res.data.country || "",
                    bio:res.data.bio || "",
                    profileImage:res.data.profileImage || ""
                });

            })
            .catch(err=>console.log(err));

        }


    },[]);



    const handleChange=(e)=>{

        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        });

    };
const togglePassword=(field)=>{

    setShowPassword({
        ...showPassword,
        [field]:!showPassword[field]
    });

};
const handlePasswordChange=(e)=>{

    setPasswordData({
        ...passwordData,
        [e.target.name]: e.target.value
    });

};


const changePassword = async()=>{

    if(passwordData.newPassword !== passwordData.confirmPassword){

        setMessage("New passwords do not match");
        return;

    }


    try{

        const res = await api.put(
            `/users/change-password/${user._id}`,
            {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }
        );

setSuccessMessage(res.data.message);


// clear inputs
setPasswordData({
    currentPassword:"",
    newPassword:"",
    confirmPassword:""
});


// close form
setPasswordOpen(false);


// remove success message after 3 seconds
setTimeout(()=>{

    setSuccessMessage("");

},3000);



    }catch(error){

        setMessage(
            error.response?.data?.message ||
            "Password change failed"
        );

    }

};




const deleteAccount = async()=>{

    const confirmDelete = window.confirm(
        "Are you sure you want to delete your account?"
    );


    if(!confirmDelete)
        return;


    try{

        await api.delete(
            `/users/${user._id}`
        );


        localStorage.removeItem("tripUser");
        localStorage.removeItem("token");


        window.location.href="/login";


    }catch(error){

        console.log(error);

    }

};


const handleImageChange = (e)=>{

    const file=e.target.files[0];

    if(file){

        setImageFile(file);

        setPreview(
            URL.createObjectURL(file)
        );

    }

};

    const updateProfile=async()=>{

        try{

           const data = new FormData();


data.append(
    "fullName",
    formData.fullName
);


data.append(
    "country",
    formData.country
);


data.append(
    "bio",
    formData.bio
);



if(imageFile){

    data.append(
        "profileImage",
        imageFile
    );

}



const res = await api.put(
    `/users/profile/${user._id}`,
    data,
    {
        headers:{
            "Content-Type":"multipart/form-data"
        }
    }
);

            setUser(res.data);
            setEditOpen(false);


        }catch(error){

            console.log(error);

        }

    };




    if(!user)
        return <h2>Loading...</h2>



return (

<div className="profilePage">


{/* Edit popup */}

{editOpen && (

<div className="overlay">

<div className="editBox">

<h2>Edit Profile</h2>


<input
name="fullName"
value={formData.fullName}
onChange={handleChange}
placeholder="Full Name"
/>


<input
name="country"
value={formData.country}
onChange={handleChange}
placeholder="Country"
/>


<textarea
name="bio"
value={formData.bio}
onChange={handleChange}
placeholder="Bio"
/>


<input
type="file"
accept="image/*"
onChange={handleImageChange}
/>
{preview &&

<img
src={preview}
className="preview"
/>

}

<div className="actions">

<button
className="save"
onClick={updateProfile}
>
Save
</button>


<button
className="cancel"
onClick={()=>setEditOpen(false)}
>
Cancel
</button>


</div>


</div>

</div>

)}




<div className="profileCard">


<img
className="avatar"
src={
user.profileImage
?
`http://localhost:5000${user.profileImage}`
:
"https://cdn-icons-png.flaticon.com/512/149/149071.png"
}
/>


<h1>{user.fullName}</h1>

<p className="email">
{user.email}
</p>


<div className="info">

<div>
<h4>Country</h4>
<p>
{user.country || "Not added"}
</p>
</div>


<div>
<h4>Bio</h4>
<p>
{user.bio || "No bio yet"}
</p>
</div>


</div>



<button
className="mainBtn"
onClick={()=>setEditOpen(true)}
>
Edit Profile
</button>



<div className="buttons">


<button
onClick={()=>setPasswordOpen(!passwordOpen)}
>
Change Password
</button>


<button
onClick={()=>setManageOpen(!manageOpen)}
>
Manage Account
</button>


<button>
📝 Posts & Stories
</button>


<button>
👥 Friends
</button>


</div>



</div>


{
successMessage &&

<p className="successMessage">
{successMessage}
</p>

}


{passwordOpen && (

<div className="section">

<h2>Change Password</h2>

<div className="passwordInput">

<input
type={showPassword.current ? "text" : "password"}
name="currentPassword"
placeholder="Current Password"
value={passwordData.currentPassword}
onChange={handlePasswordChange}
/>

<span
className="eyeIcon"
onClick={()=>togglePassword("current")}
>
{showPassword.current ? "🔓" : "🔒"}
</span>

</div>


<div className="passwordInput">

<input
type={showPassword.new ? "text" : "password"}
name="newPassword"
placeholder="New Password"
value={passwordData.newPassword}
onChange={handlePasswordChange}
/>

<span
className="eyeIcon"
onClick={()=>togglePassword("new")}
>
{showPassword.new ? "🔓" : "🔒"}
</span>

</div>


<div className="passwordInput">

<input
type={showPassword.confirm ? "text" : "password"}
name="confirmPassword"
placeholder="Confirm Password"
value={passwordData.confirmPassword}
onChange={handlePasswordChange}
/>

<span
className="eyeIcon"
onClick={()=>togglePassword("confirm")}
>
{showPassword.confirm ? "🔓" : "🔒"}
</span>

</div>

<button
className="save"
onClick={changePassword}
>
Update Password
</button>


{
message &&
<p className="message">
{message}
</p>
}


</div>

)}




{manageOpen && (

<div className="section">

<h2>Manage Account</h2>

<button
className="danger"
onClick={deleteAccount}
>
Delete Account
</button>


</div>

)}




</div>


)


}