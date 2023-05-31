import { Router } from "express";
import { generateUser } from "../utils.js";

const router = Router();

router.get("/",(req,res)=>{
    let userss=[];
    const cant = req.query.cant || 100;
    for(let i=0;i<cant;i++){
        const newUser = generateUser();
        userss.push(newUser);
    }
    res.json({userss})
});

export {router as userRouterr}