// @ts-nocheck
import { Router } from "express";
import express from "express"
import { registerView, postUser, userLogin, productsView } from "../controllers/users/user.controller.js";
import { authenticator } from "../middlewares/authenticator.js";
import session from "../middlewares/session.js";
import { passportInitialize , passportSession } from "../middlewares/passport.js";
import { sessionsRouter } from "./sessionsRouter.js";

export const userRouterOtr = Router();

userRouterOtr.use(session)
userRouterOtr.use(express.json())
userRouterOtr.use(express.urlencoded({ extended: true }))

userRouterOtr.use("/session",sessionsRouter)

userRouterOtr.get("/register", registerView)
userRouterOtr.post("/", postUser)
userRouterOtr.get("/login", userLogin)
userRouterOtr.get("/products", authenticator, productsView, (req, res, next)=>{})

userRouterOtr.use(passportInitialize, passportSession)
