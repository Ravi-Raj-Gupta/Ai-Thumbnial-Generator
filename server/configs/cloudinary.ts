import { v2 as cloudinary } from "cloudinary";

if (process.env.CLOUDINARY_URL) {
   cloudinary.config(); // Triggers configuration from the CLOUDINARY_URL environment variable
} else {
   cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
   });
}

export default cloudinary;
