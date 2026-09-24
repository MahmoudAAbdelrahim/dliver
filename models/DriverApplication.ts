import {
  Schema,
  model,
  models,
  Document,
  Types,
} from "mongoose";

export type DriverApplicationStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface IDriverApplication
  extends Document {
  user: Types.ObjectId;

  personalPhoto: string;

  nationalIdImage: string;

  vehicleImage: string;

  drivingLicenseImage?: string;

  licenseImage?: string;

  workPermit?: string;

  workPermitImage?: string;

  address: string;

  city: string;

  governorate: string;

  birthDate: Date;

  licenseNumber: string;

  nationalId: string;

  nationalIdFront: string;

  nationalIdBack: string;

  vehicleType: string;

  notes?: string;

  status:
    | "pending"
    | "approved"
    | "rejected";

  rejectionReason?: string;

  reviewedBy?: Types.ObjectId | null;

  reviewedAt?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

const DriverApplicationSchema =
  new Schema<IDriverApplication>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      personalPhoto: {
        type: String,
        required: true,
      },

      nationalIdImage: {
        type: String,
        default: "",
      },

      vehicleImage: {
        type: String,
        default: "",
      },

      drivingLicenseImage: {
        type: String,
        default: "",
      },

      licenseImage: {
        type: String,
        default: "",
      },

      workPermit: {
        type: String,
        default: "",
      },

      workPermitImage: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      governorate: {
        type: String,
        required: true,
      },

      birthDate: {
        type: Date,
        required: true,
      },

      licenseNumber: {
        type: String,
        required: true,
      },

      nationalId: {
        type: String,
        required: true,
      },

      nationalIdFront: {
        type: String,
        required: true,
      },

      nationalIdBack: {
        type: String,
        required: true,
      },

      vehicleType: {
        type: String,
        required: true,
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
        index: true,
      },

      rejectionReason: {
        type: String,
        default: "",
      },

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,

      /*
       * مهم جدًا:
       * السجل الذي أرسلته موجود في collection
       * الخاصة بطلبات المندوبين.
       */
      collection: "driverapplications",
    }
  );

const DriverApplication =
  models.DriverApplication ||
  model<IDriverApplication>(
    "DriverApplication",
    DriverApplicationSchema,
    "driverapplications"
  );

export default DriverApplication;