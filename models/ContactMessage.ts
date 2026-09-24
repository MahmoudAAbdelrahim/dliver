import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  userId?: mongoose.Types.ObjectId;
  status: "new" | "read" | "replied";
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;