import { CustomError } from "@src/middleware/errorHandler";
import { Router } from "express";

const router = Router();

router.get("/", (req,res,next)=>{
    try{
    res.send("Got room type")
    throw new CustomError('some err', 400);
    }
    catch(error){
        next(error)
    }
});

router.get("/:id", (req,res,next)=>{
    try{
        res.send(`Got id, ${req.params.id}`)
        throw new CustomError('no id founds error', 400)
    }
    catch(error){
        next(error)
    }
})
