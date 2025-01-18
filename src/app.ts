import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import csurf from "csurf"; 
import { authRouter } from "./domains/auth/routes/authRouter";
import { userRoute } from "./domains/users/routes/userRouter";
import { categoryRouter } from "./domains/categories/routes/categoryRouter";
import { productRouter } from "./domains/products/routes/productRouter";
import { CartRouter } from "./domains/carts/routes/cartRouter";
import { AddressRouter } from "./domains/address/routes/addressRouter";
import { DiscountRouter } from "./domains/discounts/router/discountRouter";
import { wishlistRouter } from "./domains/wishlists/route/wishlistRouter";
import { OrderRouter } from "./domains/orders/router/orderRouter";
import { ShippingRouter } from "./domains/shippings/router/shipingRouter";
import { PaymentRouter } from "./domains/payments/router/paymentRouter";
import {sendEmailRouter} from './domains/send-email/route/sendEmailRouter'
import { notificationRoute } from "./domains/notifications/router/notificationRouter";
import errorHandler from "./middlewares/errorHandler";

import {CORS_ORIGIN} from "./config/env";

const app = express();

const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [process.env.CORS_ORIGIN, 'https://shop.trioagus.cloud'];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.set('trust proxy', true); 


// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Ensure "public/images" directory exists
const publicDirs = ['images', 'categories', 'products'];
publicDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), 'public', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", CartRouter);
app.use("/api/addresses", AddressRouter);
app.use("/api/discounts", DiscountRouter);
app.use("/api/wishlists", wishlistRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/shippings", ShippingRouter);
app.use("/api/payments", PaymentRouter);
app.use("/api/send-email", sendEmailRouter);
app.use("/api/notifications", notificationRoute);

// Error handling middleware
app.use(errorHandler);

export default app;
