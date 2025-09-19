import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";

export async function GET() {
  try {
await connect();

    const response = NextResponse.json({
      message: "LogOut successfully",
      success: true,
    });

    // Clear the cookie by setting it to empty and expiring it
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0), // expires immediately
      path: "/",            // ensure it's removed from all paths
    });

    return response; // ✅ You forgot this
  } catch (error) {
    if(error instanceof Error){
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
