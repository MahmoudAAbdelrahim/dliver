import {
  Schema,
  model,
  models,
  Document,
  Types,
} from "mongoose";

export type OrderStatus =
  | "pending_admin"
  | "admin_rejected"
  | "pending_driver"
  | "driver_accepted"
  | "driver_rejected"
  | "driver_timeout"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PickupMethod =
  | "hand_to_hand"
  | "drop_off";

export type PaymentMethod =
  | "cash_on_delivery"
  | "card";

export interface IOrder extends Document {
  customer: Types.ObjectId;

  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };

  pickup: {
    method: PickupMethod;
    address: string;
    city: string;
    details: string;
  };

  delivery: {
    recipientName: string;
    recipientPhone: string;
    governorate: string;
    city: string;
    address: string;
    details: string;
  };

  images: string[];

  paymentMethod: PaymentMethod;

  driver?: Types.ObjectId | null;

  deliveryFee: number;

  status: OrderStatus;
driverRejectionReason?: string;

driverRejectedAt?: Date | null;
  driverResponseExpiresAt?: Date | null;

  driverAcceptedAt?: Date | null;

  pickedUpAt?: Date | null;

  deliveredAt?: Date | null;

  cancelledAt?: Date | null;

  cancellationReason?: string;

  adminNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customerInfo: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    pickup: {
      method: {
        type: String,
        enum: [
          "hand_to_hand",
          "drop_off",
        ],
        required: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      details: {
        type: String,
        default: "",
        trim: true,
      },
    },

    delivery: {
      recipientName: {
        type: String,
        required: true,
        trim: true,
      },

      recipientPhone: {
        type: String,
        required: true,
        trim: true,
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

      details: {
        type: String,
        required: true,
        trim: true,
      },
    },

    images: {
      type: [String],
      default: [],
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash_on_delivery",
        "card",
      ],
      required: true,
    },

    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending_admin",
        "admin_rejected",
        "pending_driver",
        "driver_accepted",
        "driver_rejected",
        "driver_timeout",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
      default: "pending_admin",
      index: true,
    },
driverRejectionReason: {
  type: String,
  default: "",
  trim: true,
},

driverRejectedAt: {
  type: Date,
  default: null,
},
    driverResponseExpiresAt: {
      type: Date,
      default: null,
    },

    driverAcceptedAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  models.Order ||
  model<IOrder>("Order", OrderSchema);

export default Order;