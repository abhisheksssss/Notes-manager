import { connect } from "@/dbConfig/dbConfig";
import { sendEmail } from "@/helpers/mailer";
import User from "@/model/model";
import {  NextRequest, NextResponse } from "next/server";




export async function POST(request:NextRequest) {
    try {
        connect();
        const reqBody= await request.json();
        const{ email }=reqBody;
    if(!email){
        return NextResponse.json({message:"No Email Founded"},{status:400})
    } 
    
    console.log("This is the email",email)



const user= await User.findOne({email});

if(!user){
    return NextResponse.json({message:"No user found"},{status:400})
}
await sendEmail({ email, emailType: "RESET", userId: user._id })

return NextResponse.json({
    message:"Email is sended successFully",
success:true
})

} catch (error) {
        if(error instanceof Error){
        console.log("Error in Forget password",error)
            return NextResponse.json({message:"internal server error"},{status:500});
        }
    }
}