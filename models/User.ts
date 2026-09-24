import {
  Schema,
  model,
  models,
  Document,
} from "mongoose";

export type Role =
  | "customer"
  | "driver"
  | "admin";

export type DriverStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  password: string;

  avatar: string;

  address: string;
  city: string;

  role: Role;

  driverStatus: DriverStatus;

  isVerified: boolean;
  isBlocked: boolean;

  refreshToken?: string;

  lastLogin?: Date;

  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    avatar: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: [
        "customer",
        "driver",
        "admin",
      ],
      default: "customer",
    },

    driverStatus: {
      type: String,
      enum: [
        "none",
        "pending",
        "approved",
        "rejected",
        "suspended",
      ],
      default: "none",
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

const User =
  models.User ||
  model<IUser>("User", UserSchema);

export default User;