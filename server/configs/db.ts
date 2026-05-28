import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
   try {
      // Force Node to use Google and Cloudflare DNS for SRV record resolution
      try {
         dns.setServers(["8.8.8.8", "1.1.1.1"]);
         console.log("[DB] Custom DNS servers set to Google (8.8.8.8) & Cloudflare (1.1.1.1)");
      } catch (dnsErr) {
         console.warn("[DB] Failed to set custom DNS servers, relying on system default:", dnsErr);
      }

      mongoose.connection.on("connected", () =>
         console.log("MongoDB connected"),
      );
      await mongoose.connect(process.env.MONGODB_URI as string);
   } catch (error) {
      console.error("Error connecting to MongoDB:", error);
   }
};

export default connectDB;
