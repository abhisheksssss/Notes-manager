import mongoose from "mongoose";





const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true,"Plese provide a username"],
        trim:true,
        unique:true
    },
    email:{
        type:String,
        required:[true,"Please provide an email"],
        match:[/.+\@.+\..+/,"please use a valid email address"],
        unique:true,
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
    },
    isVerfied:{
type:Boolean,
default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    forgotpasswordToken:String,
    forgotpasswordTokenExpiry:Date,
    verifyToken:String,
    verifyTokenExpiry:Date
})


const User = mongoose.models.users || mongoose.model("users",userSchema)


export default User







//Ther is the special methord to export mongoose in next js/IN express the
//  model file didi"t run again and again automatically.
// But in next we have to export and import model file quite a lot . Take care of the case if model is a;ready vreated we have not to create once again  