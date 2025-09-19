import {connect} from "@/dbConfig/dbConfig"
import User from "@/model/model"
import { NextRequest, NextResponse   } from "next/server"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/helpers/mailer"






export async function POST(request:NextRequest) {
   await connect()
    try {
       const reqBody= await request.json();
const {username,email,password}=reqBody

 //check if user already exist

 const user= await User.findOne({email})
if(user){
    return NextResponse.json({error:"User already exists"},{status:400})
}
//hash password
const salt= await bcrypt.genSalt(10)
const hashedpassword= await bcrypt.hash(password,salt)


const newUser=new User({
    username,
    email,
    password:hashedpassword
})


const savedUser=await newUser.save();
console.log(savedUser);

//send verification email

 await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id })

 
return NextResponse.json({
    message:"User is created Successfully",
success:true,
savedUser})

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({error: errorMessage}, {status:500})
       
    }
}