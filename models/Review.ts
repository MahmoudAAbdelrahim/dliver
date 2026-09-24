import { Schema, model, models, Document, Types } from "mongoose";

export type ReviewRole = "customer" | "driver";

export interface IReview extends Document {
  order: Types.ObjectId;
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  reviewerRole: ReviewRole;
  revieweeRole: ReviewRole;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewerRole: {
      type: String,
      enum: ["customer", "driver"],
      required: true,
    },
    revieweeRole: {
      type: String,
      enum: ["customer", "driver"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });
ReviewSchema.index({ reviewee: 1, createdAt: -1 });
ReviewSchema.index({ revieweeRole: 1, createdAt: -1 });

const Review = models.Review || model<IReview>("Review", ReviewSchema);
export default Review;
