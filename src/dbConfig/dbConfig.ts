import mongoose from "mongoose";

let isConnected = false; // Track connection state

export async function connect() {
  if (isConnected) {
    return; // Prevent multiple connections in serverless
  }

  if (!process.env.MONGO_URI) {
    throw new Error("❌ No Mongo URI found");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!, {
      bufferCommands: false,
    });

    isConnected = conn.connections[0].readyState === 1;

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error. Please make sure MongoDB is running: " + err);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Something went wrong in DB connection", error);
    throw error;
  }
}
