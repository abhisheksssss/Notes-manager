import {getDataFromToken} from "@/helpers/getDataFromToken";
import {connect} from "@/dbConfig/dbConfig"
import User from "@/model/model";
import { NextResponse } from "next/server";

await connect()


export async function GET(request) {
    try {
        const userId= await getDataFromToken(request);
        const user= await User.findOne({_id:userId}).select("-password");
        return NextResponse.json({
            message:"User found",
            data:user
        })
    } catch (error) {
        return NextResponse.json({error:error.message},{status:400})
    }
}