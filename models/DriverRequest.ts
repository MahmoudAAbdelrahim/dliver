import {
  Schema,
  model,
  models,
  Document,
  Types,
} from "mongoose";

export interface IDriverRequest extends Document {
  user: Types.ObjectId;

  nationalId: string;
  birthDate: Date;

  governorate: string;
  city: string;
  address: string;

  vehicleType: string;
  licenseNumber: string;

  nationalIdFront: string;
  nationalIdBack: string;
  licenseImage: string;
  personalPhoto: string;

  workPermit?: string;

  notes?: string;

  status:
    | "pending"
    | "approved"
    | "rejected";

  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const DriverRequestSchema =
  new Schema<IDriverRequest>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },

      nationalId: {
        type: String,
        required: true,
        trim: true,
      },

      birthDate: {
        type: Date,
        required: true,
      },

      governorate: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      vehicleType: {
        type: String,
        required: true,
        trim: true,
      },

      licenseNumber: {
        type: String,
        required: true,
        trim: true,
      },

      nationalIdFront: {
        type: String,
        required: true,
      },

      nationalIdBack: {
        type: String,
        required: true,
      },

      licenseImage: {
        type: String,
        required: true,
      },

      personalPhoto: {
        type: String,
        required: true,
      },

      workPermit: {
        type: String,
        default: "",
      },

      notes: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
      },

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      reviewedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

const DriverRequest =
  models.DriverRequest ||
  model<IDriverRequest>(
    "DriverRequest",
    DriverRequestSchema
  );

export default DriverRequest;