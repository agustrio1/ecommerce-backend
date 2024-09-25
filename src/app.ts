import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { authRouter } from "./domains/auth/routes/authRouter";
import { userRoute } from "./domains/users/routes/userRouter";
import { categoryRouter } from "./domains/categories/routes/categoryRouter";
import { productRouter } from "./domains/products/routes/productRouter";
import { CartRouter } from "./domains/carts/routes/cartRouter";
import { AddressRouter } from "./domains/address/routes/addressRouter";
import { DiscountRouter } from "./domains/discounts/router/discountRouter";
import { wishlistRouter } from "./domains/wishlists/route/wishlistRouter";
import { OrderRouter } from "./domains/orders/router/orderRouter";

import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(cors());

app.use(express.json());

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Ensure the "public/images" directory exists
const imagesDir = path.join(__dirname, "..", "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRouter)
app.use("/api/products", productRouter)
app.use("/api/carts", CartRouter)
app.use("/api/addresses", AddressRouter)
app.use("/api/discounts", DiscountRouter)
app.use("/api/wishlists", wishlistRouter)
app.use("/api/orders", OrderRouter)

app.use(errorHandler);

export default app;
