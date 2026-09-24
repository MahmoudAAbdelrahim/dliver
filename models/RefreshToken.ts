// src/models/RefreshToken.ts

import {
  Schema,
  model,
  models,
  Document,
  Types,
} from "mongoose";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;

  token: string;

  userAgent: string;

  ipAddress: string;

  expiresAt: Date;

  revoked: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const RefreshTokenSchema =
  new Schema<IRefreshToken>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      token: {
        type: String,
        required: true,
        unique: true,
      },

      userAgent: {
        type: String,
        default: "",
      },

      ipAddress: {
        type: String,
        default: "",
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      revoked: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

RefreshTokenSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

const RefreshToken =
  models.RefreshToken ||
  model<IRefreshToken>(
    "RefreshToken",
    RefreshTokenSchema
  );

export default RefreshToken;