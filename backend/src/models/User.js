import mongoose from "mongoose";

const idDocumentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
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
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["client", "organizer", "admin"],
      default: "client",
    },

    idDocument: {
      type: idDocumentSchema,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.toPublicUser = function toPublicUser() {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    fullName: this.fullName,
    name: this.fullName,
    email: this.email,
    role: this.role,
    idFileName: this.idDocument?.originalName,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
