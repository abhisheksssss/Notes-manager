import { connect } from "@/dbConfig/dbConfig";
import User from "@/model/model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()

if(!reqBody){
return NextResponse.json({ error: "Invalid or empty JSON body" }, { status: 400 });

}

    const { email, password } = reqBody;
    console.log(reqBody);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid Password" }, { status: 400 });
    }
    
    if(user.isVerfied==="false"){
  return NextResponse.json({ error: "User is not Veriied Yet check you email to get User verified" }, { status: 400 });
    }

    // Create token
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      message: "Login Successfully",
      success: true,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    if(error instanceof Error){
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 400 });}
  }
}
