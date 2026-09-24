import {
  Schema,
  model,
  models,
  Document,
  Types,
} from "mongoose";

export type ChangeRequestType =
  | "price"
  | "driver";

export type ChangeRequestStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface IOrderChangeRequest
  extends Document {
  order: Types.ObjectId;

  customer: Types.ObjectId;

  type: ChangeRequestType;

  oldValue?: string;

  newValue?: string;

  reason: string;

  status: ChangeRequestStatus;

  reviewedBy?: Types.ObjectId | null;

  reviewedAt?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

const OrderChangeRequestSchema =
  new Schema<IOrderChangeRequest>(
    {
      order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true,
      },

      customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: [
          "price",
          "driver",
        ],
        required: true,
      },

      oldValue: {
        type: String,
        default: "",
      },

      newValue: {
        type: String,
        default: "",
      },

      reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
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
    }
  );

const OrderChangeRequest =
  models.OrderChangeRequest ||
  model<IOrderChangeRequest>(
    "OrderChangeRequest",
    OrderChangeRequestSchema
  );

export default OrderChangeRequest;