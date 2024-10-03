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
import errorHandler from "./middlewares/errorHandler";

import {CORS_ORIGIN} from "./config/env";

const app = express();

app.use(cors(
  {
    origin: [`${CORS_ORIGIN}`, "http://localhost:3000"],
    credentials: true
  }
));
app.use(express.json());
app.use(cookieParser());

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Ensure "public/images" directory exists
const imagesDir = path.join(__dirname, "..", "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

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

// Error handling middleware
app.use(errorHandler);

export default app;
