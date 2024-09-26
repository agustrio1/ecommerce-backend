import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET;

// export const PRISMA_ENDPOINT = process.env.PRISMA_ENDPOINT || "https://us1.prisma.sh/public-unicorn-01/ecommerce-be/dev";

export const CORS_ORIGIN = process.env.CORS_ORIGIN;

export const CLIENT_URL = process.env.CLIENT_URL;

export const DATABASE_URL = process.env.DATABASE_URL;
export const EMAIL_ADMIN = process.env.EMAIL_ADMIN;

export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const SHIPPINGS_TOKEN= process.env.SHIPPINGS_TOKEN;
export const RAJAONGKIR_BASE_URL= process.env.RAJAONGKIR_BASE_URL;
export const RAJAONGKIR_BASE_CITY_URL= process.env.RAJAONGKIR_BASE_CITY_URL;
