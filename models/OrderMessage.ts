import {
  Schema,
  model,
  models,
  Document,
  Types,
} from "mongoose";

export type OrderMessageSender =
  | "customer"
  | "admin";

export interface IOrderMessage
  extends Document {
  order: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: OrderMessageSender;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderMessageSchema =
  new Schema<IOrderMessage>(
    {
      order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true,
      },

      sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      senderRole: {
        type: String,
        enum: [
          "customer",
          "admin",
        ],
        required: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
      },
    },
    {
      timestamps: true,
    }
  );

const OrderMessage =
  models.OrderMessage ||
  model<IOrderMessage>(
    "OrderMessage",
    OrderMessageSchema
  );

export default OrderMessage;