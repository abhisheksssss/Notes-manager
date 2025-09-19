import { NextRequest, NextResponse } from "next/server";
import User from "@/model/model";
import bcrypt from "bcryptjs";


export async function POST(request:NextRequest){
   try {
     const reqBody = await request.json()
console.log(reqBody)

 const {password,userId}=reqBody;

 console.log(password);
     if (!userId || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

 
 const salt= await bcrypt.genSalt(10)
 const hashedpassword= await bcrypt.hash(password,salt)

 await User.findByIdAndUpdate(
  userId,
  { password: hashedpassword },
  { new: true, runValidators: true }
)
return NextResponse.json({message:'Password updated successfully'},{status:200})
   } catch (error) {
    console.log(error)
    return NextResponse.json({message:'Error updating password'},{status:500})
   }

}