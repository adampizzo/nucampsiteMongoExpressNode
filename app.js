var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var campsiteRouter = require("./routes/campsiteRouter");
var partnerRouter = require("./routes/partnerRouter");
var promotionRouter = require("./routes/partnerRouter");

// import createHttpError from "http-errors";
// import express from "express";
// import path from "path";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";

// import indexRouter from "./routes/indexRouter.js";
// import userRouter from "./routes/userRouter.js";
// import campsiteRouter from "./routes/campsiteRouter.js";
// import partnerRouter from "./routes/partnerRouter.js";
// import promotionRouter from "./routes/promotionRouter.js";

// import { dirname } from "path";
// import { fileURLToPath } from "url";

// const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createHttpError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
