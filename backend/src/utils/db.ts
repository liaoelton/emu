import mongoose from "mongoose";

export const connect_to_db = async () => {
    mongoose.connection.on("connecting", () => console.log("Connecting to MongoDB..."));
    mongoose.connection.on("error", (error) => console.error("Connection error:", error));
    mongoose.connection.once("open", () => console.log("Connected to MongoDB"));

    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/solana-block-explorer", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
};
