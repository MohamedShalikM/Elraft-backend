import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      sparse:true
    },
    password: {
      type: String,
      minlength: 8,
    },
    googleId:{
        type:mongoose.Schema.Types.String,
        unique:true,
        sparse:true
    },
    
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
