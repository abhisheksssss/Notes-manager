import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken=(request:NextRequest)=>{
    try {
        const token =request.cookies.get("token")?.value || "";
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!);
        if (typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
            return (decodedToken as jwt.JwtPayload).id;
        }
        throw new Error("Invalid token payload: 'id' not found.");
    } catch (error) {
        if(error instanceof Error){
            throw new Error(error.message);
        }
    }
}