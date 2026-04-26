import mongoose from "mongoose";

const connectDB = async () => {
   try {
      mongoose.connection.on('error', (error) => console.error('❌ MongoDB connection error:', error))
      mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'))

      await mongoose.connect(process.env.MONGODB_URI as string, {
         connectTimeoutMS: 10000,
         serverSelectionTimeoutMS: 10000,
         socketTimeoutMS: 45000,
      })

   } catch (error) {
      console.error('⚠️  MongoDB connection failed:', error instanceof Error ? error.message : error)
      console.warn('💡 Server will continue running - features requiring MongoDB may not work')
      // Don't re-throw; let the server continue running
   }
}

export default connectDB
