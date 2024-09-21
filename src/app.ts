import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { authRouter } from "./domains/auth/routes/authRouter";
import { userRoute } from "./domains/users/routes/userRouter";
import { categoryRouter } from "./domains/categories/routes/categoryRouter";
import { productRouter } from "./domains/products/routes/productRouter";

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

export default app;
