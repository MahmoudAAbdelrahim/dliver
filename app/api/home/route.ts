import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";
import Order from "@/models/Order";
import Review from "@/models/Review";

const ACTIVE_ORDER_STATUSES = [
  "pending_admin",
  "pending_driver",
  "driver_accepted",
  "picked_up",
  "on_the_way",
];

function getUserId(payload: any) {
  return payload?.userId ?? payload?.id ?? payload?._id ?? payload?.sub ?? null;
}

function numberOrZero(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function roundRating(value: unknown) {
  return Math.round(numberOrZero(value) * 10) / 10;
}

function dateValue(value: unknown) {
  return value instanceof Date ? value.toISOString() : value || null;
}

async function getRatingForUser(userId: Types.ObjectId) {
  const [result] = await Review.aggregate([
    { $match: { reviewee: userId } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    average: roundRating(result?.average),
    count: numberOrZero(result?.count),
  };
}

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    let payload: any = null;

    if (token) {
      try {
        payload = verifyAccessToken(token);
      } catch {
        payload = null;
      }
    }

    const requestedRole = payload?.role ?? "guest";
    const userId = getUserId(payload);

    let currentUser: any = null;

    if (userId && Types.ObjectId.isValid(userId)) {
      currentUser = await User.findById(userId)
        .select(
          "_id fullName email phone avatar address city role driverStatus isBlocked deletedAt"
        )
        .lean();
    }

    const role = currentUser?.role ?? requestedRole ?? "guest";

    const [
      totalCustomers,
      activeDrivers,
      suspendedDrivers,
      totalOrders,
      deliveredOrders,
      activeOrders,
      cancelledOrders,
      pendingDriverCount,
      totalFees,
      driverRatingSummary,
      customerRatingSummary,
      recentPlatformReviews,
    ] = await Promise.all([
      User.countDocuments({ role: "customer", deletedAt: null }),
      User.countDocuments({
        role: "driver",
        driverStatus: "approved",
        isBlocked: false,
        deletedAt: null,
      }),
      User.countDocuments({
        role: "driver",
        driverStatus: "suspended",
        deletedAt: null,
      }),
      Order.countDocuments({}),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: { $in: ACTIVE_ORDER_STATUSES } }),
      Order.countDocuments({ status: "cancelled" }),
      User.countDocuments({
        role: "driver",
        driverStatus: "pending",
        deletedAt: null,
      }),
      Order.aggregate([
        { $match: { status: "delivered" } },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$deliveryFee", 0] } },
          },
        },
      ]),
      Review.aggregate([
        { $match: { revieweeRole: "driver" } },
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
      Review.aggregate([
        { $match: { revieweeRole: "customer" } },
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
      Review.find({})
        .populate("reviewer", "fullName avatar role")
        .populate("reviewee", "fullName avatar role")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const platform = {
      totalCustomers,
      activeDrivers,
      suspendedDrivers,
      totalOrders,
      deliveredOrders,
      activeOrders,
      cancelledOrders,
      completedFees: numberOrZero(totalFees?.[0]?.total),
      driverRating: {
        average: roundRating(driverRatingSummary?.[0]?.average),
        count: numberOrZero(driverRatingSummary?.[0]?.count),
      },
      customerRating: {
        average: roundRating(customerRatingSummary?.[0]?.average),
        count: numberOrZero(customerRatingSummary?.[0]?.count),
      },
    };

    const reviews = recentPlatformReviews.map((review: any) => ({
      _id: String(review._id),
      rating: review.rating,
      comment: review.comment || "",
      reviewerRole: review.reviewerRole,
      revieweeRole: review.revieweeRole,
      reviewerName: review.reviewer?.fullName || "مستخدم مسجل",
      reviewerAvatar: review.reviewer?.avatar || "",
      revieweeName: review.reviewee?.fullName || "مستخدم مسجل",
      createdAt: dateValue(review.createdAt),
    }));

    if (!currentUser || role === "guest") {
      return NextResponse.json({
        success: true,
        role: "guest",
        user: null,
        platform,
        stats: null,
        recentOrders: [],
        recentReviews: reviews,
        pendingRatings: [],
        admin: null,
      });
    }

    if (role === "customer") {
      const customerObjectId = new Types.ObjectId(currentUser._id);

      const [customerOrders, customerRating] = await Promise.all([
        Order.find({ customer: customerObjectId })
          .populate("driver", "_id fullName phone avatar city driverStatus")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        getRatingForUser(customerObjectId),
      ]);

      const customerTotals = await Promise.all([
        Order.countDocuments({ customer: customerObjectId }),
        Order.countDocuments({
          customer: customerObjectId,
          status: { $in: ACTIVE_ORDER_STATUSES },
        }),
        Order.countDocuments({ customer: customerObjectId, status: "delivered" }),
        Order.countDocuments({ customer: customerObjectId, status: "cancelled" }),
      ]);

      const deliveredIds = customerOrders
        .filter((order: any) => order.status === "delivered")
        .map((order: any) => order._id);

      const myReviews = await Review.find({
        reviewer: customerObjectId,
        order: { $in: deliveredIds },
      })
        .select("order rating comment")
        .lean();

      const myReviewMap = new Map(
        myReviews.map((item: any) => [String(item.order), item])
      );

      const recentOrders = customerOrders.map((order: any) => ({
        _id: String(order._id),
        status: order.status,
        deliveryFee: numberOrZero(order.deliveryFee),
        paymentMethod: order.paymentMethod,
        createdAt: dateValue(order.createdAt),
        pickup: {
          city: order.pickup?.city || "",
          address: order.pickup?.address || "",
        },
        delivery: {
          recipientName: order.delivery?.recipientName || "",
          city: order.delivery?.city || "",
          governorate: order.delivery?.governorate || "",
          address: order.delivery?.address || "",
        },
        driver: order.driver
          ? {
              _id: String(order.driver._id),
              fullName: order.driver.fullName,
              phone: order.driver.phone,
              avatar: order.driver.avatar || "",
              city: order.driver.city || "",
              driverStatus: order.driver.driverStatus,
            }
          : null,
        myReview: myReviewMap.has(String(order._id))
          ? {
              rating: myReviewMap.get(String(order._id))?.rating,
              comment: myReviewMap.get(String(order._id))?.comment || "",
            }
          : null,
      }));

      const pendingRatings = recentOrders.filter(
        (order: any) => order.status === "delivered" && !order.myReview && order.driver
      );

      const activeOrder = recentOrders.find((order: any) =>
        ACTIVE_ORDER_STATUSES.includes(order.status)
      );

      return NextResponse.json({
        success: true,
        role,
        user: {
          _id: String(currentUser._id),
          fullName: currentUser.fullName,
          avatar: currentUser.avatar || "",
          city: currentUser.city || "",
          driverStatus: currentUser.driverStatus,
          rating: customerRating,
        },
        platform,
        stats: {
          totalOrders: customerTotals[0],
          activeOrders: customerTotals[1],
          deliveredOrders: customerTotals[2],
          cancelledOrders: customerTotals[3],
          rating: customerRating,
        },
        recentOrders,
        recentReviews: reviews.filter(
          (review: any) => review.revieweeRole === "customer"
        ),
        pendingRatings,
        focusOrderId: activeOrder?._id ?? null,
        admin: null,
      });
    }

    if (role === "driver") {
      const driverObjectId = new Types.ObjectId(currentUser._id);

      const [driverOrders, driverRating] = await Promise.all([
        Order.find({ driver: driverObjectId })
          .populate("customer", "_id fullName phone avatar city")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        getRatingForUser(driverObjectId),
      ]);

      const driverTotals = await Promise.all([
        Order.countDocuments({ driver: driverObjectId }),
        Order.countDocuments({
          driver: driverObjectId,
          status: { $in: ACTIVE_ORDER_STATUSES },
        }),
        Order.countDocuments({ driver: driverObjectId, status: "delivered" }),
        Order.countDocuments({
          driver: driverObjectId,
          status: { $in: ["driver_rejected", "driver_timeout"] },
        }),
      ]);

      const completedFees = await Order.aggregate([
        {
          $match: {
            driver: driverObjectId,
            status: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$deliveryFee", 0] } },
          },
        },
      ]);

      const deliveredIds = driverOrders
        .filter((order: any) => order.status === "delivered")
        .map((order: any) => order._id);

      const myReviews = await Review.find({
        reviewer: driverObjectId,
        order: { $in: deliveredIds },
      })
        .select("order rating comment")
        .lean();

      const myReviewMap = new Map(
        myReviews.map((item: any) => [String(item.order), item])
      );

      const recentOrders = driverOrders.map((order: any) => ({
        _id: String(order._id),
        status: order.status,
        deliveryFee: numberOrZero(order.deliveryFee),
        paymentMethod: order.paymentMethod,
        createdAt: dateValue(order.createdAt),
        delivery: {
          recipientName: order.delivery?.recipientName || "",
          recipientPhone: order.delivery?.recipientPhone || "",
          city: order.delivery?.city || "",
          governorate: order.delivery?.governorate || "",
          address: order.delivery?.address || "",
        },
        customer: order.customer
          ? {
              _id: String(order.customer._id),
              fullName: order.customer.fullName,
              phone: order.customer.phone,
              avatar: order.customer.avatar || "",
              city: order.customer.city || "",
            }
          : null,
        myReview: myReviewMap.has(String(order._id))
          ? {
              rating: myReviewMap.get(String(order._id))?.rating,
              comment: myReviewMap.get(String(order._id))?.comment || "",
            }
          : null,
      }));

      const pendingRatings = recentOrders.filter(
        (order: any) => order.status === "delivered" && !order.myReview && order.customer
      );

      const activeOrder = recentOrders.find((order: any) =>
        ACTIVE_ORDER_STATUSES.includes(order.status)
      );

      return NextResponse.json({
        success: true,
        role,
        user: {
          _id: String(currentUser._id),
          fullName: currentUser.fullName,
          avatar: currentUser.avatar || "",
          city: currentUser.city || "",
          driverStatus: currentUser.driverStatus,
          isBlocked: currentUser.isBlocked,
          rating: driverRating,
        },
        platform,
        stats: {
          totalOrders: driverTotals[0],
          activeOrders: driverTotals[1],
          deliveredOrders: driverTotals[2],
          rejectedOrders: driverTotals[3],
          completedFees: numberOrZero(completedFees?.[0]?.total),
          rating: driverRating,
        },
        recentOrders,
        recentReviews: reviews.filter(
          (review: any) => review.revieweeRole === "driver"
        ),
        pendingRatings,
        focusOrderId: activeOrder?._id ?? null,
        admin: null,
      });
    }

    if (role === "admin") {
      const [recentOrdersRaw, pendingDrivers, pendingAdminOrders] = await Promise.all([
        Order.find({})
          .populate("customer", "_id fullName email phone avatar")
          .populate("driver", "_id fullName phone avatar city driverStatus")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        User.find({
          role: "driver",
          driverStatus: "pending",
          deletedAt: null,
        })
          .select("_id fullName email phone avatar city createdAt")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        Order.find({ status: "pending_admin" })
          .populate("customer", "_id fullName phone avatar")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
      ]);

      const adminRecentOrders = recentOrdersRaw.map((order: any) => ({
        _id: String(order._id),
        status: order.status,
        deliveryFee: numberOrZero(order.deliveryFee),
        createdAt: dateValue(order.createdAt),
        customer: order.customer
          ? {
              _id: String(order.customer._id),
              fullName: order.customer.fullName,
              phone: order.customer.phone,
              email: order.customer.email,
              avatar: order.customer.avatar || "",
            }
          : null,
        driver: order.driver
          ? {
              _id: String(order.driver._id),
              fullName: order.driver.fullName,
              phone: order.driver.phone,
              avatar: order.driver.avatar || "",
              driverStatus: order.driver.driverStatus,
            }
          : null,
      }));

      return NextResponse.json({
        success: true,
        role,
        user: {
          _id: String(currentUser._id),
          fullName: currentUser.fullName,
          avatar: currentUser.avatar || "",
        },
        platform,
        stats: {
          totalCustomers,
          activeDrivers,
          pendingDrivers: pendingDriverCount,
          pendingOrders: await Order.countDocuments({ status: "pending_admin" }),
          activeOrders,
          deliveredOrders,
          cancelledOrders,
          completedFees: platform.completedFees,
          driverRating: platform.driverRating,
          customerRating: platform.customerRating,
        },
        recentOrders: adminRecentOrders,
        recentReviews: reviews,
        pendingRatings: [],
        focusOrderId: null,
        admin: {
          pendingDrivers: pendingDrivers.map((item: any) => ({
            _id: String(item._id),
            fullName: item.fullName,
            phone: item.phone,
            email: item.email,
            avatar: item.avatar || "",
            city: item.city || "",
            createdAt: dateValue(item.createdAt),
          })),
          pendingAdminOrders: pendingAdminOrders.map((order: any) => ({
            _id: String(order._id),
            createdAt: dateValue(order.createdAt),
            deliveryFee: numberOrZero(order.deliveryFee),
            customer: order.customer
              ? {
                  fullName: order.customer.fullName,
                  phone: order.customer.phone,
                  avatar: order.customer.avatar || "",
                }
              : null,
          })),
          suspendedDrivers,
        },
      });
    }

    return NextResponse.json({
      success: true,
      role: "guest",
      user: null,
      platform,
      stats: null,
      recentOrders: [],
      recentReviews: reviews,
      pendingRatings: [],
      admin: null,
    });
  } catch (error) {
    console.error("HOME API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل بيانات الصفحة الرئيسية.",
      },
      { status: 500 }
    );
  }
}
