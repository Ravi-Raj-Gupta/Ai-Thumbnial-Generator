import mongoose from "mongoose";

export interface Iuser extends Document{
   name: string;
   email: string;
   password?: string;
   createdAt?: Date;
   updatedAt?: Date;
}

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true, 
      trim: true
   },
   email : {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
   },
   password: {
      type: String,
      required: true
   }

},{
   timestamps: true
})


const User = mongoose.models.User || mongoose.model<Iuser>("User", userSchema)
export default User