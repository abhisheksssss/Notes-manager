import {connect} from "@/dbConfig/dbConfig"
import { NextRequest,NextResponse } from "next/server"
import User from "@/model/model"




export async function POST(request:NextRequest){
    try {
        await connect();

        const reqBody= await request.json();
        const {token}=reqBody;
         console.log("THis is tokens",token);
         console.log("THis is the gt time", Date.now() )
           
const user = await User.findOne({ 
forgotpasswordToken: token
});

console.log("THis is the user", user);

   if(!user){
    throw new Error("No user founded")
   }
   console.log("THis i user from VerifyEmail",user);


   user.forgotpasswordToken= undefined;
   user.forgotpasswordTOkenExpiry= undefined;
   await user.save();
 return NextResponse.json({ message: "Email Verified", userId: user._id },{status:200})

    } catch ( error) {
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500})
    }
}