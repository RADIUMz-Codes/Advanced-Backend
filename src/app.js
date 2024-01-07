import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Accept json upto 16kb
app.use(express.json({ limit: "16kb" }));

// It parses incoming requests with URL-encoded payloads and is based on a body parser.
// extended true for nested objs
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());
export { app };
