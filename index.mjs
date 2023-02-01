import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import ErrorHandler from "./middlewares/ErrorHandler.mjs";
import adminRouter from "./routes/admin.route.mjs";
import Debug from "./utils/Debug.mjs";
import authorizeAdmin from "./middlewares/authorizeAdmin.mjs";
dotenv.config();
if (process.env.DEV === "TRUE") Debug.enabled = true;
else Debug.enabled = false;
const app = express();
const port = process.env.PORT || 4000;

const corsOptions = {
  origin: process.env.ORIGIN_ALLOWED || "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.ADMIN_COOKIE_SECRET,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      maxAge: Number(process.env.ADMIN_COOKIE_EXP || 3 * 60 * 60 * 1000),
    },
    resave: false,
  })
);
app.use("/admin/", adminRouter);

app.get("/", authorizeAdmin, (req, res) => {
  res.json({ message: "app is running properly ... ;}" });
});
app.use(ErrorHandler);
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_URL)
  .then((res) =>
    app.listen(port, async () => {
      Debug.success("Server is running ...");
    })
  )
  .catch((err) => {
    Debug.error(err);
  });
