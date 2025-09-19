import {connect} from "@/dbConfig/dbConfig"
import { NextRequest,NextResponse } from "next/server"
import User from "@/model/model"




export async function POST(request:NextRequest){
await connect();
    try {
        const reqBody= await request.json();
        const {token}=reqBody;
         console.log("This is tokens",token);

   const user = await User.findOne({verifyToken:token, verifyTokenExpiry:{$gt:Date.now()}})
   if(!user){
    return NextResponse.json({error:"Invalid Token"},{status:400})
   }
   console.log("THis i user from VerifyEmail",user);

   user.isVerfied= true;
   user.verifyToken= undefined
   user.verifyTokenExpiry= undefined;
   await user.save();
 return NextResponse.json({message:"Email Verified",success:true})

    } catch ( error) {
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500})
    }
}