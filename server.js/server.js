// =====================================================================
//  TravelNest — Secure Server (single file, v2)
//
//  FILE KA LAYOUT
//   1. Imports & Config          7. Auth helpers & middleware
//   2. Errors & small utils      8. Routes: Auth
//   3. App setup & security      9. Routes: Hotels / Cars / Bikes (public + owner)
//   4. External services        10. Routes: Bookings
//      (Cloudinary, Razorpay,   11. Routes: Payments + Webhook
//       Mail, Multer)           12. Routes: Listing edit / delete
//   5. DB models                13. Health, 404, Error handler
//   6. Business helpers         14. Startup & graceful shutdown
// =====================================================================


// =====================================================================
//  1. IMPORTS & CONFIG
// =====================================================================

// NOTE: "dotenv/config" sabse pehle import hona chahiye, taaki neeche ke
// modules (db.js, etc.) load hote waqt .env ki values mil jayein.
import "dotenv/config";

import path        from "path";
import crypto      from "crypto";
import express     from "express";
import cors        from "cors";
import helmet      from "helmet";
import jwt         from "jsonwebtoken";
import multer      from "multer";
import nodemailer  from "nodemailer";
import rateLimit   from "express-rate-limit";
import mongoose    from "mongoose";
import Razorpay    from "razorpay";
import { v2 as cloudinaryV2 } from "cloudinary";

import connectDB         from "./Database/db.js";
import signupUser        from "./Database/signup.js";
import BasicInfo         from "./Database/hotellistdata.js";
import HotelPhotos       from "./Database/picturecollect.js";
import HotelDetails      from "./Database/detailsdata.js";
import MergedHotels      from "./Database/MergedHotels.js";
import updateMergedHotel from "./Database/updateMergedHotel.js";
import CarList           from "./Database/carlistdata.js";
import BikeList          from "./Database/bikelist.js";
import Booking           from "./Database/Booking.js";

// ---------- ENV check: zaroori values na mile to server start nahi hoga ----------
const REQUIRED_ENV = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];

const IS_PROD = process.env.NODE_ENV === "production";

const envProblems = REQUIRED_ENV.filter((key) => !process.env[key]).map((k) => `${k} missing`);

if (process.env.JWT_SECRET && process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
  envProblems.push("JWT_SECRET and JWT_REFRESH_SECRET must be different");
}
if (IS_PROD) {
  if (!process.env.FRONTEND_URL) envProblems.push("FRONTEND_URL required in production");
  for (const key of ["JWT_SECRET", "JWT_REFRESH_SECRET"]) {
    if ((process.env[key] || "").length < 32) envProblems.push(`${key} must be at least 32 characters`);
  }
}

if (envProblems.length > 0) {
  console.error(`❌ Environment problems:\n - ${envProblems.join("\n - ")}`);
  process.exit(1);
}

// ---------- Saari settings ek jagah ----------
const DAY_MS = 24 * 60 * 60 * 1000;

const CONFIG = Object.freeze({
  port:             process.env.PORT || 3000,
  isProd:           IS_PROD,
  jwtSecret:        process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenTtl:   process.env.ACCESS_TOKEN_TTL || "1d",   // production mein "15m" ya "1h" rakho
  refreshTokenMs:   7 * DAY_MS,
  // Comma separated, e.g. FRONTEND_URL=https://travelnest.com,https://www.travelnest.com
  allowedOrigins: (process.env.FRONTEND_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  maxBookingDays:   90,
  fullRefundHours:  Number(process.env.REFUND_FULL_HOURS) || 24,
  maxOtpAttempts:   5,
  maxPhotosPerHotel: 30,
});



// =====================================================================
//  2. ERRORS & SMALL UTILS
// =====================================================================

// Jo error client ko dikhana safe hai, wahi HttpError se throw karo
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// try/catch ki jagah: async route ka error seedha error handler tak jaata hai
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ---------- HTML / Regex escape ----------
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------- Validation / parsing ----------
const isValidEmail    = (e) => typeof e === "string" && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone    = (p) => /^[0-9]{10}$/.test(String(p));
const isValidPassword = (p) => typeof p === "string" && p.length >= 6 && p.length <= 128;

// Query / body se string lo, warna ""
const asString = (v) => (typeof v === "string" ? v : "");

const asNumber = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Positive integer ID ya null
const parseId = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// "true"/true -> true, "false"/false -> false, baaki undefined
const toBool = (v) =>
  v === true || v === "true" ? true : v === false || v === "false" ? false : undefined;

// Required text: string ho, khali na ho, max length se zyada na ho
const text = (value, label, { max = 100, required = true } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new HttpError(400, `${label} is required.`);
    return "";
  }
  if (typeof value !== "string") throw new HttpError(400, `${label} must be text.`);
  const t = value.trim();
  if (required && !t) throw new HttpError(400, `${label} is required.`);
  if (t.length > max) throw new HttpError(400, `${label} must be at most ${max} characters.`);
  return t;
};

const parseEmail = (value) => {
  if (!isValidEmail(value)) throw new HttpError(400, "Invalid email format.");
  return value.toLowerCase().trim();
};

const parsePhone = (value, label = "Contact number") => {
  if (!isValidPhone(value)) throw new HttpError(400, `${label} must be 10 digits.`);
  return String(value);
};

const parsePositive = (value, label) => {
  const n = Number(value);
  if (!(n > 0) || !Number.isFinite(n)) throw new HttpError(400, `${label} must be greater than 0.`);
  return n;
};

const clampInt = (value, min, max, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const getPagination = (query) => {
  const page  = clampInt(query.page, 1, 100000, 1);
  const limit = clampInt(query.limit, 1, 50, 20);
  return { page, limit, skip: (page - 1) * limit };
};

// 9 digit random ID, DB mein duplicate check ke saath
const generateUniqueId = async (Model, field) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = crypto.randomInt(100000000, 1000000000);
    if (!(await Model.exists({ [field]: id }))) return id;
  }
  throw new Error("Could not generate unique ID");
};

// ---------- Hashing & safe compare ----------
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

// Timing-safe compare (dono ko hash karke, taaki length leak na ho)
const safeEqual = (a, b) =>
  crypto.timingSafeEqual(
    crypto.createHash("sha256").update(String(a)).digest(),
    crypto.createHash("sha256").update(String(b)).digest()
  );

// ---------- Date helpers (format: YYYY-MM-DD) ----------
const parseDateOnly = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  // 2026-02-31 jaisi dates reject karne ke liye round-trip check
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? null : d;
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Aaj ki date IST mein (00:00 UTC ke roop mein)
const todayIST = () => {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  return new Date(`${ist.toISOString().slice(0, 10)}T00:00:00Z`);
};

// Check-in ka asli moment: IST ki raat 12 baje
const checkInInstant = (booking) => new Date(booking.checkInDate).getTime() - IST_OFFSET_MS;

// check-in se shuru hokar "days" tak ki dates ["2026-10-20", "2026-10-21", ...]
const getDateKeys = (checkIn, days) =>
  Array.from({ length: days }, (_, i) =>
    new Date(checkIn.getTime() + i * DAY_MS).toISOString().slice(0, 10)
  );

// ---------- Public response helpers ----------
const PRIVATE_FIELDS = "-ownerEmail -owner_id";

const publicBooking = (booking) => {
  const obj = typeof booking.toObject === "function" ? booking.toObject() : { ...booking };
  delete obj.ownerEmail;
  delete obj.owner_id;
  return obj;
};



// =====================================================================
//  3. APP SETUP & SECURITY
// =====================================================================

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1); // Render / Railway / Heroku / Nginx ke peeche asli IP ke liye

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / mobile app jaisi requests mein origin nahi hota
      if (!origin) return callback(null, true);
      // Dev mein FRONTEND_URL na ho to sab allow (production mein env check pehle hi rok deta hai)
      if (CONFIG.allowedOrigins.length === 0 && !CONFIG.isProd) return callback(null, true);
      if (CONFIG.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new HttpError(403, "Origin not allowed."));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  })
);

// rawBody save: Razorpay webhook ka signature raw body par verify hota hai
app.use(
  express.json({
    limit: "100kb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// NoSQL injection: body/query mein "$gt", "a.b", "__proto__" jaisi keys reject
const hasDangerousKeys = (value, depth = 0) => {
  if (depth > 6) return true;
  if (Array.isArray(value)) return value.some((v) => hasDangerousKeys(v, depth + 1));
  if (value && typeof value === "object") {
    return Object.entries(value).some(
      ([k, v]) =>
        k.startsWith("$") || k.includes(".") || k === "__proto__" || hasDangerousKeys(v, depth + 1)
    );
  }
  return false;
};

app.use((req, res, next) => {
  if (req.path === "/razorpay-webhook") return next(); // Razorpay ka apna format hai, signature se verify hota hai
  if (hasDangerousKeys(req.body) || hasDangerousKeys(req.query)) {
    return next(new HttpError(400, "Invalid input."));
  }
  next();
});

// ---------- Rate limiters ----------
const makeLimiter = ({ max, message, windowMs = 15 * 60 * 1000, skip }) =>
  rateLimit({
    windowMs,
    max,
    skip,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

// Webhook (Razorpay ke servers se) aur health check par general limit nahi
const generalLimiter = makeLimiter({
  max: 300,
  message: "Too many requests. Please try again after 15 minutes.",
  skip: (req) => req.path === "/razorpay-webhook" || req.path === "/health",
});
const authLimiter    = makeLimiter({ max: 10, message: "Too many attempts. Please try again after 15 minutes." });
const paymentLimiter = makeLimiter({ max: 30, message: "Too many payment requests. Please try again later." });

app.use(generalLimiter);



// =====================================================================
//  4. EXTERNAL SERVICES
// =====================================================================

// ---------- 4A. Cloudinary ----------
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinaryV2.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

// Asli file content (magic bytes) se type pata karo — mimetype fake ho sakta hai
const detectImageType = (buf) => {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
};

// Cloudinary se images hatao (kuch fail ho to bhi baaki chalti rehti hain)
const destroyImages = (images = []) =>
  Promise.allSettled(
    images
      .filter((img) => img?.publicId)
      .map((img) => cloudinaryV2.uploader.destroy(img.publicId))
  );

// Files check karke upload karta hai. Koi ek fail ho to jo upload ho chuki thi wo bhi hat jaati hain.
const uploadImages = async (files, folder) => {
  const types = files.map((f) => detectImageType(f.buffer));
  if (types.some((t) => !t)) throw new HttpError(400, "Only JPG, PNG, WEBP images allowed");

  const settled = await Promise.allSettled(files.map((f) => uploadToCloudinary(f.buffer, folder)));
  const failed  = settled.find((s) => s.status === "rejected");

  if (failed) {
    await destroyImages(
      settled.filter((s) => s.status === "fulfilled").map((s) => ({ publicId: s.value.public_id }))
    );
    throw failed.reason;
  }

  return settled.map((s, i) => ({
    imageName: path.basename(files[i].originalname || "image").slice(0, 100),
    imageUrl:  s.value.secure_url,
    publicId:  s.value.public_id,
    imageType: types[i],
  }));
};

// ---------- 4B. Multer ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10, fields: 30, fieldSize: 20 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, "Only JPG, PNG, WEBP images allowed"));
  },
});

// ---------- 4C. Razorpay ----------
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------- 4D. Email ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Email fail hone par bhi API nahi tootegi
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: `"TravelNest" <${process.env.EMAIL_USER}>`, to, subject, html });
    console.log(`✅ Email sent → ${to}`);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

// Background mein bhejo — API ko email ka wait nahi karna padta
const sendEmailInBackground = (to, subject, html) => {
  void sendEmail(to, subject, html);
};

// ---------- Email templates (har dynamic value escape hoti hai) ----------
const formatINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const emailRow = (label, value, { bold = false } = {}) =>
  `<tr><td style="padding:8px 0;color:#888">${escapeHtml(label)}</td><td style="padding:8px 0${bold ? ";font-weight:700" : ""}">${escapeHtml(value)}</td></tr>`;

const emailTotalRow = (amount) =>
  `<tr style="border-top:2px solid #f0f0f0">
    <td style="padding:12px 0;font-weight:700;font-size:16px">Total</td>
    <td style="padding:12px 0;font-weight:700;font-size:16px;color:#e07b39">${escapeHtml(formatINR(amount))}</td>
  </tr>`;

const emailShell = ({ color, title, subtitle, subtitleColor, rows, extraHtml = "", footer }) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden">
  <div style="background:${color};padding:24px 28px">
    <h2 style="color:#fff;margin:0">${title}</h2>
    <p style="color:${subtitleColor};margin:6px 0 0">${subtitle}</p>
  </div>
  <div style="padding:24px 28px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    ${extraHtml}
    <p style="font-size:12px;color:#bbb;margin-top:20px">${footer}</p>
  </div>
</div>`;

const ownerNewBookingEmail = (b) =>
  emailShell({
    color: "#1a1a2e",
    title: "New Booking! 📋",
    subtitle: `Someone booked your ${escapeHtml(b.serviceType)}.`,
    subtitleColor: "#aaa",
    rows: [
      emailRow("Booking ID", `#${b.booking_id}`, { bold: true }),
      emailRow("Service", b.serviceName),
      emailRow("Guest Name", b.guestName),
      emailRow("Guest Phone", b.guestPhone),
      emailRow("Guest Email", b.guestEmail || "—"),
      emailRow("Check-in", b.checkInDate),
      emailRow("Check-out", b.checkOutDate),
      emailTotalRow(b.totalAmount),
    ].join(""),
    footer: "Login to TravelNest Dashboard to Accept or Reject.",
  });

const guestConfirmedEmail = (b) =>
  emailShell({
    color: "#2e7d32",
    title: "Booking Confirmed! 🎉",
    subtitle: "Owner ne aapki booking accept kar li!",
    subtitleColor: "#c8e6c9",
    rows: [
      emailRow("Booking ID", `#${b.booking_id}`, { bold: true }),
      emailRow("Service", b.serviceName),
      emailRow("Check-in", b.checkInDate),
      emailRow("Check-out", b.checkOutDate),
      emailTotalRow(b.totalAmount),
    ].join(""),
    extraHtml: `<div style="background:#fff8f0;border-radius:8px;padding:14px;margin-top:16px;font-size:13px;color:#888">
      Owner contact: <strong style="color:#333">${escapeHtml(b.ownerContact)}</strong></div>`,
    footer: "Thank you for choosing TravelNest!",
  });

const guestCancelledEmail = (b) =>
  emailShell({
    color: "#c62828",
    title: "Booking Cancelled ❌",
    subtitle: "Aapki booking cancel ho gayi hai.",
    subtitleColor: "#ffcdd2",
    rows: [
      emailRow("Booking ID", `#${b.booking_id}`, { bold: true }),
      emailRow("Service", b.serviceName),
    ].join(""),
    extraHtml:
      (b.paymentStatus === "refunded"
        ? `<p style="font-size:13px;color:#555;margin-top:16px">Aapka payment refund process ho gaya hai. Bank ke hisaab se 5-7 din lag sakte hain.</p>`
        : "") +
      `<p style="font-size:13px;color:#555;margin-top:16px">Koi sawaal ho to contact karein.</p>`,
    footer: "— TravelNest Team",
  });

const ownerCancelledByGuestEmail = (b) =>
  emailShell({
    color: "#c62828",
    title: "Booking Cancelled ❌",
    subtitle: "Guest ne booking cancel kar di.",
    subtitleColor: "#ffcdd2",
    rows: [
      emailRow("Booking ID", `#${b.booking_id}`, { bold: true }),
      emailRow("Service", b.serviceName),
      emailRow("Guest", `${b.guestName} — ${b.guestPhone}`),
    ].join(""),
    footer: "— TravelNest Team",
  });

const welcomeEmail = (name) => `
<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
  <h2 style="color:#e07b39">Welcome, ${escapeHtml(name)}! 🎉</h2>
  <p>Your TravelNest account has been created successfully.</p>
  <p style="color:#888;font-size:13px">If you didn't sign up, please ignore this email.</p>
</div>`;

const otpEmail = (otp) => `
<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
  <h2 style="color:#e07b39">Password Reset OTP</h2>
  <p>Aapka OTP code hai:</p>
  <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1a1a2e;margin:20px 0;padding:16px;background:#f5f5f5;border-radius:8px;text-align:center">${escapeHtml(otp)}</div>
  <p style="color:#888;font-size:13px">Yeh OTP 10 minutes mein expire ho jaayega.</p>
  <p style="color:#888;font-size:13px">Agar aapne request nahi ki toh ignore karein.</p>
</div>`;



// =====================================================================
//  5. DB MODELS (is file ke andar wale helper models)
// =====================================================================

// ---------- Refresh token (logout par revoke karne ke liye) ----------
// TTL index purane tokens khud delete kar deta hai.
const refreshTokenSchema = new mongoose.Schema({
  user_id:   { type: String, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date,   required: true, index: { expires: 0 } },
});

const RefreshToken =
  mongoose.models.RefreshToken || mongoose.model("RefreshToken", refreshTokenSchema);

// ---------- Booking lock (double booking race condition rokne ke liye) ----------
// Har (service + din + slot) ki ek unique key. Same key dobara insert nahi ho sakti.
const bookingLockSchema = new mongoose.Schema({
  key:        { type: String, required: true, unique: true },
  booking_id: { type: Number, required: true, index: true },
  expiresAt:  { type: Date,   required: true, index: { expires: 0 } },
});

const BookingLock =
  mongoose.models.BookingLock || mongoose.model("BookingLock", bookingLockSchema);



// =====================================================================
//  6. BUSINESS HELPERS
// =====================================================================

// ---------- 6A. Service registry: hotel / car / bike ki saari settings ek jagah ----------
// FIELD_RULES: edit route mein har field ki validation. undefined return = invalid.
const FIELD_RULES = {
  text:    (v) => (typeof v === "string" && v.trim() && v.trim().length <= 200 ? v.trim() : undefined),
  price:   (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : undefined),
  amount0: (v) => (v !== null && v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : undefined),
  int:     (v) => (Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 500 ? Number(v) : undefined),
  phone:   (v) => (isValidPhone(v) ? String(v) : undefined),
  bool:    toBool,
};

const SERVICES = {
  hotel: {
    Model:   BasicInfo,
    idField: "hotel_id",
    price:   (r) => r.pricePerNight,
    name:    (r) => r.hotelName,
    units:   (r) => Math.max(1, Number(r.totalRooms) || 1),   // hotel mein kai rooms
    editable: {
      hotelName: "text", ownerName: "text", hotelLocation: "text",
      pricePerNight: "price", contactNumber: "phone", totalRooms: "int",
    },
    getImages:   async (doc) => (await HotelPhotos.findOne({ hotel_id: doc.hotel_id }))?.hotelImages || [],
    afterChange: (doc) => updateMergedHotel(doc.hotel_id),
    cleanup: async (doc) => {
      await HotelPhotos.deleteMany({ hotel_id: doc.hotel_id });
      await HotelDetails.deleteMany({ hotel_id: doc.hotel_id });
      await MergedHotels.deleteMany({ hotel_id: doc.hotel_id });
    },
  },

  car: {
    Model:   CarList,
    idField: "car_id",
    price:   (r) => r.pricePerDay,
    name:    (r) => `${r.carName} ${r.carModel}`,
    units:   () => 1,
    needsAvailability: true,
    editable: {
      carName: "text", carModel: "text", pricePerDay: "price", pricePerHour: "amount0",
      pickupLocation: "text", fuelType: "text", seats: "int",
      contactNumber: "phone", isAvailable: "bool",
    },
    getImages: async (doc) => doc.carImages || [],
  },

  bike: {
    Model:   BikeList,
    idField: "bike_id",
    price:   (r) => r.pricePerDay,
    name:    (r) => `${r.bikeName} ${r.bikeModel}`,
    units:   () => 1,
    needsAvailability: true,
    editable: {
      bikeName: "text", bikeModel: "text", bikeType: "text", pricePerDay: "price",
      pricePerHour: "amount0", pickupLocation: "text", fuelType: "text",
      contactNumber: "phone", isAvailable: "bool", helmetIncluded: "bool",
    },
    getImages: async (doc) => doc.bikeImages || [],
  },
};

// ---------- 6B. Email address resolve ----------
// Owner ka email: record mein ho to wahi, warna owner ke account se (purani listings ke liye).
const resolveOwnerEmail = async (record) => {
  if (isValidEmail(record?.ownerEmail)) return record.ownerEmail;
  if (!record?.owner_id) return "";
  try {
    const owner = await signupUser.findById(record.owner_id).select("email");
    return owner?.email || "";
  } catch {
    return "";
  }
};

// Guest ka email: booking form mein diya ho to wahi, warna booking karne wale ke account se.
const resolveGuestEmail = async (booking) => {
  if (isValidEmail(booking?.guestEmail)) return booking.guestEmail;
  if (!booking?.user_id) return "";
  try {
    const user = await signupUser.findById(booking.user_id).select("email");
    return user?.email || "";
  } catch {
    return "";
  }
};

// ---------- 6C. Booking status rules ----------
const STATUS_TRANSITIONS = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["cancelled"],
  cancelled: [],
};

// ---------- 6D. OTP wrong-attempt tracking (memory mein) ----------
// NOTE: Agar server ke ek se zyada instances chalate ho to ise Redis / DB mein shift karna.
const otpAttempts = new Map(); // email -> { count, expiresAt }

const getOtpAttempts = (email) => {
  const entry = otpAttempts.get(email);
  if (!entry) return 0;
  if (Date.now() > entry.expiresAt) {
    otpAttempts.delete(email);
    return 0;
  }
  return entry.count;
};

const addOtpAttempt = (email) => {
  const count = getOtpAttempts(email) + 1;
  otpAttempts.set(email, { count, expiresAt: Date.now() + 15 * 60 * 1000 });
};

// Memory saaf rakhne ke liye har 30 min mein purane entries hatao
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of otpAttempts) {
    if (now > entry.expiresAt) otpAttempts.delete(key);
  }
}, 30 * 60 * 1000).unref();

// ---------- 6E. Booking locks ----------
// Ek khali slot (room/unit) dhoondh kar sab dino ke locks le leta hai.
// true = lock mil gaya, false = saare slots bhare hue hain.
const acquireLocks = async ({ serviceType, service_id, dateKeys, totalUnits, booking_id, checkOut }) => {
  const expiresAt = new Date(checkOut.getTime() + DAY_MS);

  for (let slot = 1; slot <= totalUnits; slot++) {
    const docs = dateKeys.map((d) => ({
      key: `${serviceType}:${service_id}:${d}:${slot}`,
      booking_id,
      expiresAt,
    }));

    try {
      await BookingLock.insertMany(docs, { ordered: true });
      return true;
    } catch (err) {
      // Is slot ke jo locks insert ho gaye the unhe wapas hatao
      await BookingLock.deleteMany({ key: { $in: docs.map((d) => d.key) }, booking_id });

      // 11000 = duplicate key, yaani slot bhara hai — agla slot try karo
      const isDuplicate = err?.code === 11000 || err?.writeErrors?.some((e) => e.code === 11000);
      if (!isDuplicate) throw err;
    }
  }
  return false;
};

const releaseLocks = (booking_id) => BookingLock.deleteMany({ booking_id: Number(booking_id) });

// ---------- 6F. Refund ----------
// Return: "not_paid" | "no_refund" | "refunded"
// Owner cancel kare to hamesha full refund. Guest late cancel kare to refund nahi.
// Caller ko booking.save() khud karna hai.
const refundIfPaid = async (booking, { byOwner = false } = {}) => {
  if (booking.paymentStatus !== "paid" || !booking.paymentId) return "not_paid";

  if (!byOwner) {
    const hoursLeft = (checkInInstant(booking) - Date.now()) / (60 * 60 * 1000);
    if (hoursLeft < CONFIG.fullRefundHours) return "no_refund";
  }

  try {
    const refund = await razorpay.payments.refund(booking.paymentId, {
      speed: "normal",
      notes: { booking_id: String(booking.booking_id) },
    });

    booking.paymentStatus = "refunded";
    booking.refundId      = refund.id;
    return "refunded";

  } catch (err) {
    // Refund fail hua to booking cancel nahi hogi, taaki paisa na fase
    console.error("❌ Refund failed:", err?.error?.description || err.message);
    throw new HttpError(502, "Refund failed. Please contact support.");
  }
};

// ---------- 6G. Payment settle (verify-payment aur webhook dono yahi use karte hain) ----------
// 1) Atomic update: do jagah se ek saath aaye to bhi sirf ek "paid" mark karega.
// 2) Booking pehle hi cancel thi to turant refund. Refund fail ho to retry par dobara try hoga.
const settlePayment = async (bookingDoc, payment) => {
  await Booking.updateOne(
    { _id: bookingDoc._id, paymentStatus: { $nin: ["paid", "refunded"] } },
    { $set: { paymentStatus: "paid", paymentId: String(payment.id) } }
  );

  const fresh = await Booking.findById(bookingDoc._id);

  if (fresh && fresh.status === "cancelled" && fresh.paymentStatus === "paid") {
    await refundIfPaid(fresh, { byOwner: true });
    await fresh.save();
  }

  return fresh;
};



// =====================================================================
//  7. AUTH HELPERS & MIDDLEWARE
// =====================================================================

const createAccessToken = (user) =>
  jwt.sign({ id: String(user._id), email: user.email }, CONFIG.jwtSecret, {
    algorithm: "HS256",
    expiresIn: CONFIG.accessTokenTtl,
  });

// Refresh token DB mein hash ke roop mein save hota hai, taaki revoke ho sake
const createRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { id: String(user._id), email: user.email, jti: crypto.randomUUID() },
    CONFIG.jwtRefreshSecret,
    { algorithm: "HS256", expiresIn: Math.floor(CONFIG.refreshTokenMs / 1000) }
  );

  await RefreshToken.create({
    user_id:   String(user._id),
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + CONFIG.refreshTokenMs),
  });

  return refreshToken;
};

// Login check middleware
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Token missing. Please login."));
  }

  try {
    req.user = jwt.verify(token, CONFIG.jwtSecret, { algorithms: ["HS256"] });
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token. Please login again."));
  }
};



// =====================================================================
//  8. ROUTES — AUTH
// =====================================================================

app.get("/", (req, res) => res.send("TravelNest Server Running ✅"));

// ---------- Signup ----------
app.post("/signup", authLimiter, asyncHandler(async (req, res) => {
  const name     = text(req.body.name, "Name", { max: 60 });
  const email    = parseEmail(req.body.email);
  const password = req.body.password;

  if (!isValidPassword(password)) {
    throw new HttpError(400, "Password must be 6 to 128 characters.");
  }

  if (await signupUser.exists({ email })) {
    throw new HttpError(409, "Email already registered.");
  }

  try {
    // Password trim nahi karte — signup aur login dono mein same rakha hai
    await signupUser.create({ name, email, password });
  } catch (error) {
    if (error?.code === 11000) throw new HttpError(409, "Email already registered."); // race condition
    throw error;
  }

  sendEmailInBackground(email, "Welcome to TravelNest! 🎉", welcomeEmail(name));

  res.status(201).json({ message: "Signup Successful" });
}));

// ---------- Login ----------
app.post("/login", authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new HttpError(400, "Email and password are required.");
  if (!isValidEmail(email)) throw new HttpError(400, "Invalid email format.");
  if (typeof password !== "string" || password.length > 128) {
    throw new HttpError(400, "Invalid password.");
  }

  const user = await signupUser.findOne({ email: email.toLowerCase().trim() });

  // Dono cases mein same message — taaki email registered hai ya nahi, pata na chale
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const token        = createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  const [hotelListing, carListing, bikeListing] = await Promise.all([
    BasicInfo.exists({ owner_id: user._id }),
    CarList.exists({ owner_id: user._id }),
    BikeList.exists({ owner_id: user._id }),
  ]);

  res.status(200).json({
    message: "Login Successful",
    token,
    refreshToken,
    name:        user.name,
    has_listing: !!(hotelListing || carListing || bikeListing),
  });
}));

// ---------- Refresh token (rotation: purana token use hote hi invalid) ----------
app.post("/refresh-token", authLimiter, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== "string") {
    throw new HttpError(401, "Refresh token missing.");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, CONFIG.jwtRefreshSecret, { algorithms: ["HS256"] });
  } catch {
    throw new HttpError(401, "Invalid or expired refresh token. Please login again.");
  }

  const deleted = await RefreshToken.findOneAndDelete({ tokenHash: sha256(refreshToken) });

  if (!deleted) {
    // Valid token dobara use hua = chori ka shak. Us user ke saare sessions band.
    await RefreshToken.deleteMany({ user_id: String(payload.id) });
    throw new HttpError(401, "Refresh token revoked. Please login again.");
  }

  // Account delete / badal gaya ho to naya token nahi
  const user = await signupUser.findById(payload.id).select("email");
  if (!user) throw new HttpError(401, "Account not found. Please login again.");

  res.status(200).json({
    token:        createAccessToken(user),
    refreshToken: await createRefreshToken(user),
  });
}));

// ---------- Logout (is device ka refresh token revoke) ----------
app.post("/logout", asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken && typeof refreshToken === "string") {
    await RefreshToken.deleteOne({ tokenHash: sha256(refreshToken) });
  }

  res.status(200).json({ message: "Logged out." });
}));

// ---------- Logout everywhere (saare devices) ----------
app.post("/logout-all", verifyToken, asyncHandler(async (req, res) => {
  await RefreshToken.deleteMany({ user_id: String(req.user.id) });
  res.status(200).json({ message: "Logged out from all devices." });
}));

// ---------- Forgot password ----------
app.post("/forgot-password", authLimiter, asyncHandler(async (req, res) => {
  if (!isValidEmail(req.body.email)) throw new HttpError(400, "Valid email required.");

  const email = req.body.email.toLowerCase().trim();
  const user  = await signupUser.findOne({ email }).select("_id");

  if (user) {
    const otp = crypto.randomInt(100000, 1000000).toString(); // secure 6 digit OTP

    await signupUser.updateOne(
      { _id: user._id },
      { $set: { resetOtp: sha256(otp), resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000) } }
    );

    otpAttempts.delete(email);
    sendEmailInBackground(email, "TravelNest — Password Reset OTP", otpEmail(otp));
  }

  // Email registered ho ya na ho, response same
  res.status(200).json({ message: "If this email is registered, an OTP has been sent." });
}));

// ---------- Reset password ----------
app.post("/reset-password", authLimiter, asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  if (!req.body.email || !otp || !newPassword) {
    throw new HttpError(400, "Email, OTP and new password required.");
  }
  const email = parseEmail(req.body.email);

  if (!isValidPassword(newPassword)) {
    throw new HttpError(400, "Password must be 6 to 128 characters.");
  }
  if (typeof otp !== "string" && typeof otp !== "number") {
    throw new HttpError(400, "Invalid or expired OTP.");
  }

  // Galat attempts ke baad OTP lock
  if (getOtpAttempts(email) >= CONFIG.maxOtpAttempts) {
    await signupUser.updateOne({ email }, { $unset: { resetOtp: 1, resetOtpExpiry: 1 } });
    throw new HttpError(429, "Too many wrong attempts. Please request a new OTP.");
  }

  const user = await signupUser.findOne({ email });

  const otpValid =
    user &&
    user.resetOtp &&
    user.resetOtpExpiry &&
    new Date() <= user.resetOtpExpiry &&
    safeEqual(user.resetOtp, sha256(otp));

  // Har failure par same message
  if (!otpValid) {
    addOtpAttempt(email);
    throw new HttpError(400, "Invalid or expired OTP.");
  }

  user.password       = newPassword;
  user.resetOtp       = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  otpAttempts.delete(email);

  // Password badalte hi saare purane login sessions band
  await RefreshToken.deleteMany({ user_id: String(user._id) });

  res.status(200).json({ message: "Password reset successful. Please login." });
}));



// =====================================================================
//  9. ROUTES — HOTELS / CARS / BIKES
// =====================================================================

// ---------- 9A. Public list handler (filter + pagination + owner info hidden) ----------
const makePublicListHandler = ({ Model, locationField, priceField, exactFilters = [] }) =>
  asyncHandler(async (req, res) => {
    const filter = {};

    const location = asString(req.query.location).trim().slice(0, 100);
    if (location) filter[locationField] = { $regex: escapeRegex(location), $options: "i" };

    for (const field of exactFilters) {
      const value = asString(req.query[field]).trim().slice(0, 50);
      if (value) filter[field] = value;
    }

    const minPrice = asNumber(req.query.minPrice);
    const maxPrice = asNumber(req.query.maxPrice);
    if (minPrice !== null || maxPrice !== null) {
      filter[priceField] = {};
      if (minPrice !== null) filter[priceField].$gte = minPrice;
      if (maxPrice !== null) filter[priceField].$lte = maxPrice;
    }

    const { limit, skip } = getPagination(req.query);

    const items = await Model.find(filter)
      .select(PRIVATE_FIELDS)
      .sort({ _id: -1 })       // stable order, taaki pagination mein repeat/miss na ho
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json(items);
  });

// ---------- 9B. Hotels ----------
app.post("/basic-info", verifyToken, asyncHandler(async (req, res) => {
  const hotelName     = text(req.body.hotelName, "Hotel name", { max: 100 });
  const ownerName     = text(req.body.ownerName, "Owner name", { max: 100 });
  const hotelLocation = text(req.body.hotelLocation, "Hotel location", { max: 150 });
  const pricePerNight = parsePositive(req.body.pricePerNight, "Price");
  const contactNumber = parsePhone(req.body.contactNumber);
  const totalRooms    = clampInt(req.body.totalRooms, 1, 500, 1);

  const hotel_id = await generateUniqueId(BasicInfo, "hotel_id");

  const newHotel = new BasicInfo({
    hotel_id,
    owner_id:   req.user.id,
    ownerEmail: req.user.email,       // form se nahi, login account se
    hotelName, ownerName, hotelLocation, pricePerNight, contactNumber, totalRooms,
  });

  await newHotel.save();
  await updateMergedHotel(hotel_id);

  res.status(201).json({ message: "Basic Information Saved", hotel_id, data: newHotel });
}));

// Photos: ownership check, ek hotel ka ek hi photos document
app.post("/picture", verifyToken, upload.array("hotelImages", 10), asyncHandler(async (req, res) => {
  const hotel_id = parseId(req.body.hotel_id);
  if (!hotel_id) throw new HttpError(400, "Valid hotel_id is required.");
  if (!req.files || req.files.length === 0) throw new HttpError(400, "At least one image is required.");

  const hotel = await BasicInfo.findOne({ hotel_id, owner_id: req.user.id });
  if (!hotel) throw new HttpError(403, "Not your hotel.");

  let photosDoc = await HotelPhotos.findOne({ hotel_id });
  const existingCount = photosDoc?.hotelImages?.length || 0;

  if (existingCount + req.files.length > CONFIG.maxPhotosPerHotel) {
    throw new HttpError(400, `Maximum ${CONFIG.maxPhotosPerHotel} photos per hotel.`);
  }

  const imageArray = await uploadImages(req.files, "travelnest/hotels");

  try {
    if (photosDoc) photosDoc.hotelImages.push(...imageArray);
    else photosDoc = new HotelPhotos({ hotel_id, hotelImages: imageArray });

    await photosDoc.save();
    await updateMergedHotel(hotel_id);
  } catch (error) {
    await destroyImages(imageArray);   // DB save fail to Cloudinary par kachra nahi
    throw error;
  }

  res.status(201).json({ message: "Pictures Saved", data: photosDoc });
}));

// Details: ownership check
app.post("/details", verifyToken, asyncHandler(async (req, res) => {
  const hotel_id = parseId(req.body.hotel_id);
  if (!hotel_id) throw new HttpError(400, "hotel_id and hotelDescription are required.");

  const hotelDescription = text(req.body.hotelDescription, "hotelDescription", { max: 5000 });

  // amenities: array ya comma-separated string, max 50 items
  let rawAmenities = req.body.amenities ?? [];
  if (typeof rawAmenities === "string") rawAmenities = rawAmenities.split(",");
  if (!Array.isArray(rawAmenities) || rawAmenities.length > 50) {
    throw new HttpError(400, "Invalid amenities.");
  }
  const amenities = rawAmenities.map((a) => {
    if (typeof a !== "string") throw new HttpError(400, "Invalid amenities.");
    return a.trim();
  }).filter((a) => a && a.length <= 60);

  const hotel = await BasicInfo.findOne({ hotel_id, owner_id: req.user.id });
  if (!hotel) throw new HttpError(403, "Not your hotel.");

  const existing = await HotelDetails.findOne({ hotel_id });

  if (existing) {
    existing.hotelDescription = hotelDescription;
    existing.amenities        = amenities;
    await existing.save();
    await updateMergedHotel(hotel_id);
    return res.status(200).json({ message: "Details Updated", data: existing });
  }

  const newDetails = new HotelDetails({ hotel_id, hotelDescription, amenities });
  await newDetails.save();
  await updateMergedHotel(hotel_id);

  res.status(201).json({ message: "Details Saved", data: newDetails });
}));

app.get("/hotels", makePublicListHandler({
  Model: BasicInfo, locationField: "hotelLocation", priceField: "pricePerNight",
}));

app.get("/my-hotels", verifyToken, asyncHandler(async (req, res) => {
  res.status(200).json(await BasicInfo.find({ owner_id: req.user.id }).sort({ _id: -1 }));
}));

app.get("/hotel-photos/:hotel_id", asyncHandler(async (req, res) => {
  const hotel_id = parseId(req.params.hotel_id);
  if (!hotel_id) throw new HttpError(400, "Invalid hotel id.");

  const photos = await HotelPhotos.findOne({ hotel_id });
  if (!photos) throw new HttpError(404, "Photos not found.");

  res.status(200).json(photos);
}));

app.get("/merge-hotels", asyncHandler(async (req, res) => {
  const { limit, skip } = getPagination(req.query);

  const data = await MergedHotels.find()
    .select(PRIVATE_FIELDS)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json(data);
}));

// ---------- 9C. Cars ----------
app.post("/add-car", verifyToken, upload.array("carImages", 6), asyncHandler(async (req, res) => {
  const carName        = text(req.body.carName, "Car name");
  const carModel       = text(req.body.carModel, "Car model");
  const pickupLocation = text(req.body.pickupLocation, "Pickup location", { max: 150 });
  const pricePerDay    = parsePositive(req.body.pricePerDay, "Price per day");
  const contactNumber  = parsePhone(req.body.contactNumber);
  const pricePerHour   = Math.max(0, Number(req.body.pricePerHour) || 0);
  const fuelType       = text(req.body.fuelType, "Fuel type", { max: 30, required: false });
  const seats          = clampInt(req.body.seats, 1, 100, 1);

  const car_id = await generateUniqueId(CarList, "car_id");

  const carImages = req.files?.length > 0 ? await uploadImages(req.files, "travelnest/cars") : [];

  try {
    const newCar = new CarList({
      car_id,
      owner_id:    req.user.id,
      ownerEmail:  req.user.email,     // form se nahi, login account se
      carName, carModel, pricePerDay, pricePerHour, pickupLocation,
      fuelType, seats, contactNumber, carImages,
      isAvailable: toBool(req.body.isAvailable) ?? false,
    });

    await newCar.save();
    res.status(201).json({ message: "Car Added Successfully", car_id, data: newCar });
  } catch (error) {
    await destroyImages(carImages);
    throw error;
  }
}));

app.get("/my-cars", verifyToken, asyncHandler(async (req, res) => {
  res.status(200).json(await CarList.find({ owner_id: req.user.id }).sort({ _id: -1 }));
}));

app.get("/cars", makePublicListHandler({
  Model: CarList, locationField: "pickupLocation", priceField: "pricePerDay", exactFilters: ["fuelType"],
}));

// ---------- 9D. Bikes ----------
app.post("/add-bike", verifyToken, upload.array("bikeImages", 6), asyncHandler(async (req, res) => {
  const bikeName       = text(req.body.bikeName, "Bike name");
  const bikeModel      = text(req.body.bikeModel, "Bike model");
  const pickupLocation = text(req.body.pickupLocation, "Pickup location", { max: 150 });
  const pricePerDay    = parsePositive(req.body.pricePerDay, "Price per day");
  const contactNumber  = parsePhone(req.body.contactNumber);
  const pricePerHour   = Math.max(0, Number(req.body.pricePerHour) || 0);
  const bikeType       = text(req.body.bikeType, "Bike type", { max: 30, required: false });
  const fuelType       = text(req.body.fuelType, "Fuel type", { max: 30, required: false });

  const bike_id = await generateUniqueId(BikeList, "bike_id");

  const bikeImages = req.files?.length > 0 ? await uploadImages(req.files, "travelnest/bikes") : [];

  try {
    const newBike = new BikeList({
      bike_id,
      owner_id:       req.user.id,
      ownerEmail:     req.user.email,  // form se nahi, login account se
      bikeName, bikeModel, bikeType, pricePerDay, pricePerHour,
      pickupLocation, fuelType, contactNumber, bikeImages,
      isAvailable:    toBool(req.body.isAvailable) ?? false,
      helmetIncluded: toBool(req.body.helmetIncluded) ?? false,
    });

    await newBike.save();
    res.status(201).json({ message: "Bike Added Successfully", bike_id, data: newBike });
  } catch (error) {
    await destroyImages(bikeImages);
    throw error;
  }
}));

app.get("/my-bikes", verifyToken, asyncHandler(async (req, res) => {
  res.status(200).json(await BikeList.find({ owner_id: req.user.id }).sort({ _id: -1 }));
}));

app.get("/bikes", makePublicListHandler({
  Model: BikeList, locationField: "pickupLocation", priceField: "pricePerDay", exactFilters: ["bikeType"],
}));



// =====================================================================
//  10. ROUTES — BOOKINGS
// =====================================================================

// ---------- Create booking ----------
//  - Price server calculate karta hai (client ka totalAmount ignore)
//  - Past dates, apni hi listing, double booking reject
//  - Car/Bike isAvailable check
app.post("/book", verifyToken, asyncHandler(async (req, res) => {
  const { serviceType, guestEmail, checkInDate, checkOutDate } = req.body;

  // ---------- Validation ----------
  if (typeof serviceType !== "string" || !Object.hasOwn(SERVICES, serviceType)) {
    throw new HttpError(400, "Invalid service type.");
  }
  const service    = SERVICES[serviceType];
  const service_id = parseId(req.body.service_id);

  if (!service_id || !req.body.guestPhone || !checkInDate || !checkOutDate) {
    throw new HttpError(400, "All required booking fields must be filled.");
  }

  const guestName  = text(req.body.guestName, "Guest name", { max: 100 });
  const guestPhone = parsePhone(req.body.guestPhone, "Guest phone");

  if (guestEmail && !isValidEmail(guestEmail)) {
    throw new HttpError(400, "Invalid guest email format.");
  }

  const checkIn  = parseDateOnly(checkInDate);
  const checkOut = parseDateOnly(checkOutDate);

  if (!checkIn || !checkOut) throw new HttpError(400, "Dates must be in YYYY-MM-DD format.");
  if (checkIn < todayIST())  throw new HttpError(400, "Check-in date cannot be in the past.");
  if (checkOut <= checkIn)   throw new HttpError(400, "Check-out must be after check-in.");

  const days = Math.round((checkOut - checkIn) / DAY_MS);
  if (days > CONFIG.maxBookingDays) {
    throw new HttpError(400, `Maximum ${CONFIG.maxBookingDays} days per booking.`);
  }

  // ---------- Service DB se lo ----------
  const record = await service.Model.findOne({ [service.idField]: service_id });
  if (!record) throw new HttpError(404, "Service not found.");

  if (String(record.owner_id) === String(req.user.id)) {
    throw new HttpError(400, "You cannot book your own listing.");
  }
  if (service.needsAvailability && record.isAvailable === false) {
    throw new HttpError(400, "This vehicle is not available right now.");
  }

  // ---------- Price server pe calculate ----------
  const serviceName = service.name(record);
  const totalAmount = Math.round(Number(service.price(record)) * days * 100) / 100;
  if (!(totalAmount > 0)) throw new HttpError(400, "Invalid price for this service.");

  // ---------- Double booking: pehla (saste) check ----------
  const totalUnits = service.units(record);
  const taken = await Booking.countDocuments({
    serviceType,
    service_id,
    status:       { $ne: "cancelled" },
    checkInDate:  { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  });

  if (taken >= totalUnits) {
    throw new HttpError(409, "Already booked for these dates. Please choose different dates.");
  }

  const booking_id = await generateUniqueId(Booking, "booking_id");

  // ---------- Race-safe lock: do log ek saath book na kar sakein ----------
  const locked = await acquireLocks({
    serviceType, service_id, totalUnits, booking_id, checkOut,
    dateKeys: getDateKeys(checkIn, days),
  });

  if (!locked) {
    throw new HttpError(409, "Already booked for these dates. Please choose different dates.");
  }

  // Lock lene ke baad kuch bhi fail ho to lock chhod do, warna dates atak jayengi
  let newBooking;
  try {
    newBooking = new Booking({
      booking_id,
      user_id:      req.user.id,
      owner_id:     record.owner_id || "",
      serviceType,
      service_id,
      serviceName,
      ownerContact: record.contactNumber || "",
      ownerEmail:   await resolveOwnerEmail(record),
      guestName,
      guestPhone,
      guestEmail:   guestEmail ? guestEmail.toLowerCase().trim() : "",
      checkInDate,
      checkOutDate,
      guests:       clampInt(req.body.guests, 1, 50, 1),
      totalAmount,
    });

    await newBooking.save();
  } catch (error) {
    await releaseLocks(booking_id);
    throw error;
  }

  // Sirf owner ko email — guest ko tab milegi jab owner accept kare
  if (newBooking.ownerEmail) {
    sendEmailInBackground(
      newBooking.ownerEmail,
      `New Booking! #${booking_id} — ${serviceName}`,
      ownerNewBookingEmail(newBooking)
    );
  } else {
    console.warn(`⚠️ Booking #${booking_id}: owner ka email nahi mila, mail nahi gayi.`);
  }

  res.status(201).json({
    message: "Booking placed! Waiting for owner confirmation.",
    booking_id,
    totalAmount,
    data: publicBooking(newBooking),
  });
}));

// ---------- My bookings (guest) ----------
app.get("/my-bookings", verifyToken, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user_id: req.user.id })
    .select(PRIVATE_FIELDS)
    .sort({ createdAt: -1 });

  res.status(200).json(bookings);
}));

// ---------- Cancel my booking (guest) ----------
app.patch("/cancel-booking/:booking_id", verifyToken, asyncHandler(async (req, res) => {
  const booking_id = parseId(req.params.booking_id);
  if (!booking_id) throw new HttpError(400, "Invalid booking id.");

  const booking = await Booking.findOne({ booking_id, user_id: req.user.id });
  if (!booking) throw new HttpError(404, "Booking not found.");

  if (booking.status === "cancelled") throw new HttpError(400, "Booking is already cancelled.");

  // Paid hai to refund policy ke hisaab se refund (fail hua to cancel nahi hogi)
  const refundResult = await refundIfPaid(booking);

  booking.status = "cancelled";
  await booking.save();
  await releaseLocks(booking.booking_id);

  const ownerEmail = await resolveOwnerEmail(booking);
  if (ownerEmail) {
    sendEmailInBackground(ownerEmail, `Booking Cancelled #${booking.booking_id}`, ownerCancelledByGuestEmail(booking));
  }

  const refundNote = {
    refunded:  " Refund initiated (5-7 working days).",
    no_refund: ` No refund, because cancellation is less than ${CONFIG.fullRefundHours} hours before check-in.`,
    not_paid:  "",
  }[refundResult];

  res.status(200).json({
    message: `Booking cancelled.${refundNote}`,
    refund:  refundResult,
    data:    publicBooking(booking),
  });
}));

// ---------- Owner bookings ----------
app.get("/owner-bookings", verifyToken, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ owner_id: String(req.user.id) }).sort({ createdAt: -1 });
  res.status(200).json(bookings);
}));

// ---------- Booking status update (owner) ----------
// Allowed: pending → confirmed/cancelled, confirmed → cancelled
app.patch("/booking-status/:booking_id", verifyToken, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = Object.keys(STATUS_TRANSITIONS);

  if (typeof status !== "string" || !allowedStatuses.includes(status)) {
    throw new HttpError(400, `Status must be: ${allowedStatuses.join(", ")}`);
  }

  const booking_id = parseId(req.params.booking_id);
  if (!booking_id) throw new HttpError(400, "Invalid booking id.");

  const booking = await Booking.findOne({ booking_id, owner_id: String(req.user.id) });
  if (!booking) throw new HttpError(404, "Booking not found.");

  // cancelled wapas confirmed nahi ho sakta
  if (!(STATUS_TRANSITIONS[booking.status] || []).includes(status)) {
    throw new HttpError(400, `Cannot change status from "${booking.status}" to "${status}".`);
  }

  // Owner cancel kare aur guest ne pay kiya ho to full refund
  if (status === "cancelled") await refundIfPaid(booking, { byOwner: true });

  booking.status = status;
  await booking.save();

  if (status === "cancelled") await releaseLocks(booking.booking_id);

  // Guest ko email — owner ke action ke baad
  const guestEmailTo = await resolveGuestEmail(booking);

  if (guestEmailTo) {
    if (status === "confirmed") {
      sendEmailInBackground(
        guestEmailTo,
        `Booking Confirmed! #${booking.booking_id} — ${booking.serviceName}`,
        guestConfirmedEmail(booking)
      );
    } else if (status === "cancelled") {
      sendEmailInBackground(
        guestEmailTo,
        `Booking Cancelled #${booking.booking_id} — ${booking.serviceName}`,
        guestCancelledEmail(booking)
      );
    }
  } else {
    console.warn(`⚠️ Booking #${booking.booking_id}: guest ka email nahi mila, mail nahi gayi.`);
  }

  res.status(200).json({ message: "Status Updated", data: booking });
}));



// =====================================================================
//  11. ROUTES — PAYMENTS (Razorpay)
// =====================================================================

// ---------- Create order: amount DB ki booking se aata hai, client se nahi ----------
app.post("/create-payment", verifyToken, paymentLimiter, asyncHandler(async (req, res) => {
  const booking_id = parseId(req.body.booking_id);
  if (!booking_id) throw new HttpError(400, "booking_id required.");

  const booking = await Booking.findOne({ booking_id, user_id: req.user.id });
  if (!booking) throw new HttpError(404, "Booking not found.");

  if (booking.status === "cancelled")    throw new HttpError(400, "Cancelled booking cannot be paid.");
  if (booking.paymentStatus === "paid")  throw new HttpError(400, "Booking is already paid.");

  const amountInPaise = Math.round(Number(booking.totalAmount) * 100);
  if (!(amountInPaise > 0)) throw new HttpError(400, "Invalid booking amount.");

  const orderResponse = (order) => ({
    order_id: order.id,
    amount:   order.amount,
    currency: order.currency,
    key_id:   process.env.RAZORPAY_KEY_ID,
  });

  // Pehle se order bana hai to wahi dobara use karo.
  // Naya order banane se purana overwrite hota tha aur uska payment booking se match nahi hota tha.
  if (booking.razorpayOrderId) {
    try {
      const existing = await razorpay.orders.fetch(booking.razorpayOrderId);

      if (existing.status === "paid") {
        throw new HttpError(409, "Payment already received. Booking will update shortly.");
      }
      if (Number(existing.amount) === amountInPaise) {
        return res.status(200).json(orderResponse(existing));
      }
    } catch (err) {
      if (err instanceof HttpError) throw err;
      // order fetch nahi hua — neeche naya order banega
    }
  }

  const order = await razorpay.orders.create({
    amount:   amountInPaise,
    currency: "INR",
    receipt:  `receipt_${booking.booking_id}`,
    notes:    { booking_id: String(booking.booking_id) },
  });

  booking.razorpayOrderId = order.id;
  await booking.save();

  res.status(200).json(orderResponse(order));
}));

// ---------- Verify payment: ownership + order match + signature + amount ----------
app.post("/verify-payment", verifyToken, paymentLimiter, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const booking_id = parseId(req.body.booking_id);

  if (
    typeof razorpay_order_id   !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature  !== "string" ||
    !booking_id
  ) {
    throw new HttpError(400, "Missing payment details.");
  }

  // Booking mere user ki ho + order ID wahi ho jo is booking ke liye bana tha
  const booking = await Booking.findOne({
    booking_id,
    user_id:         req.user.id,
    razorpayOrderId: razorpay_order_id,
  });
  if (!booking) throw new HttpError(404, "Booking not found for this payment.");

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (!safeEqual(expected, razorpay_signature)) {
    throw new HttpError(400, "Payment verification failed.");
  }

  // Razorpay se asli payment fetch karke order aur amount match karo
  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  const expectedPaise = Math.round(Number(booking.totalAmount) * 100);

  if (payment.order_id !== booking.razorpayOrderId || Number(payment.amount) !== expectedPaise) {
    throw new HttpError(400, "Payment details do not match this booking.");
  }

  // Capture abhi nahi hua to webhook baad mein booking update kar dega
  if (payment.status !== "captured") {
    return res.status(202).json({ message: "Payment is being confirmed. Booking will update shortly." });
  }

  await settlePayment(booking, payment);

  res.status(200).json({ message: "Payment verified successfully." });
}));

// ---------- Webhook ----------
// User ne payment ke baad tab band kar diya ho tab bhi booking "paid" ho jayegi.
// Razorpay Dashboard → Webhooks: https://<tumhara-domain>/razorpay-webhook
// Event: payment.captured   |   Secret = RAZORPAY_WEBHOOK_SECRET
app.post("/razorpay-webhook", asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  if (!signature || !req.rawBody) throw new HttpError(400, "Invalid webhook.");

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");

  if (!safeEqual(expected, String(signature))) throw new HttpError(400, "Invalid signature.");

  const event   = req.body?.event;
  const payment = req.body?.payload?.payment?.entity;

  if (event === "payment.captured" && payment?.order_id) {
    const booking = await Booking.findOne({ razorpayOrderId: payment.order_id });

    if (booking && Number(payment.amount) === Math.round(Number(booking.totalAmount) * 100)) {
      await settlePayment(booking, payment);
    }
  }

  // Koi error aaya to error handler 5xx deta hai aur Razorpay baad mein dobara try karta hai
  res.status(200).json({ status: "ok" });
}));



// =====================================================================
//  12. ROUTES — LISTING EDIT / DELETE (hotel, car, bike)
//      PATCH  /hotel/:id   /car/:id   /bike/:id
//      DELETE /hotel/:id   /car/:id   /bike/:id
// =====================================================================

for (const [type, cfg] of Object.entries(SERVICES)) {

  // ---------- Edit ----------
  app.patch(`/${type}/:id`, verifyToken, asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) throw new HttpError(400, "Invalid id.");

    const doc = await cfg.Model.findOne({ [cfg.idField]: id, owner_id: req.user.id });
    if (!doc) throw new HttpError(404, "Listing not found or not yours.");

    let changed = 0;

    for (const [key, kind] of Object.entries(cfg.editable)) {
      if (req.body[key] === undefined) continue;

      const value = FIELD_RULES[kind](req.body[key]);
      if (value === undefined) throw new HttpError(400, `Invalid value for ${key}.`);

      doc[key] = value;
      changed++;
    }

    if (changed === 0) throw new HttpError(400, "No valid fields to update.");

    await doc.save();
    if (cfg.afterChange) await cfg.afterChange(doc);

    res.status(200).json({ message: "Listing updated.", data: doc });
  }));

  // ---------- Delete (aage ki active booking ho to nahi) ----------
  app.delete(`/${type}/:id`, verifyToken, asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) throw new HttpError(400, "Invalid id.");

    const doc = await cfg.Model.findOne({ [cfg.idField]: id, owner_id: req.user.id });
    if (!doc) throw new HttpError(404, "Listing not found or not yours.");

    const activeBooking = await Booking.exists({
      serviceType:  type,
      service_id:   id,
      status:       { $ne: "cancelled" },
      checkOutDate: { $gte: todayIST().toISOString().slice(0, 10) },
    });

    if (activeBooking) {
      throw new HttpError(409, "This listing has upcoming bookings. Cancel them first.");
    }

    await destroyImages(await cfg.getImages(doc));
    await cfg.Model.deleteOne({ _id: doc._id });
    if (cfg.cleanup) await cfg.cleanup(doc);

    res.status(200).json({ message: "Listing deleted." });
  }));
}



// =====================================================================
//  13. HEALTH, 404, ERROR HANDLER
// =====================================================================

app.get("/health", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({ status: dbReady ? "ok" : "db_down" });
});

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Jaan-boojh kar throw kiye gaye errors (safe message)
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  // Multer (file size, galat field, etc.)
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File too large. Max 5MB allowed." : "Invalid file upload.";
    return res.status(400).json({ message });
  }

  // Body parser errors
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON body." });
  if (err.type === "entity.too.large")    return res.status(413).json({ message: "Request body too large." });

  // Mongoose: galat data / galat ID format
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ message: "Invalid data provided." });
  }

  // Baaki sab: andar ki detail client ko nahi dikhate
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});



// =====================================================================
//  14. STARTUP & GRACEFUL SHUTDOWN
// =====================================================================

// DB indexes (speed + unique ID guarantee).
// Purane data mein duplicate ho to unique index nahi banega — warning aayegi, server chalta rahega.
const ensureIndexes = async () => {
  const INDEXES = [
    [signupUser,   { email: 1 },                       { unique: true }],
    [Booking,      { booking_id: 1 },                  { unique: true }],
    [Booking,      { user_id: 1, createdAt: -1 }],
    [Booking,      { owner_id: 1, createdAt: -1 }],
    [Booking,      { serviceType: 1, service_id: 1, status: 1 }],
    [Booking,      { razorpayOrderId: 1 },             { sparse: true }],
    [BasicInfo,    { hotel_id: 1 },                    { unique: true }],
    [BasicInfo,    { owner_id: 1 }],
    [CarList,      { car_id: 1 },                      { unique: true }],
    [CarList,      { owner_id: 1 }],
    [BikeList,     { bike_id: 1 },                     { unique: true }],
    [BikeList,     { owner_id: 1 }],
    [HotelPhotos,  { hotel_id: 1 },                    { unique: true }],
    [HotelDetails, { hotel_id: 1 },                    { unique: true }],
  ];

  for (const [Model, spec, options = {}] of INDEXES) {
    try {
      await Model.collection.createIndex(spec, options);
    } catch (err) {
      console.warn(`⚠️ Index skipped (${Model.modelName} ${JSON.stringify(spec)}):`, err.message);
    }
  }
};

let server;

connectDB()
  .then(async () => {
    await BookingLock.init();
    await RefreshToken.init();
    await ensureIndexes();

    server = app.listen(CONFIG.port, () =>
      console.log(`TravelNest Server Running On Port ${CONFIG.port} ✅`)
    );

    // Slowloris jaise slow-connection attacks se bachav
    server.requestTimeout   = 30 * 1000;
    server.headersTimeout   = 65 * 1000;
    server.keepAliveTimeout = 61 * 1000;
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1);
  });

// Deploy / restart par chalti requests beech mein na tootein
const shutdown = (reason, exitCode = 0) => {
  console.log(`${reason} received. Shutting down...`);

  const finish = async () => {
    try { await mongoose.connection.close(); } catch { /* ignore */ }
    process.exit(exitCode);
  };

  if (server) server.close(finish);
  else finish();

  setTimeout(() => process.exit(1), 10000).unref(); // 10 sec mein band na ho to zabardasti
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

// Uncaught exception ke baad process ka state bharosemand nahi — band karke restart hone do
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  shutdown("uncaughtException", 1);
});