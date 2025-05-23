import models from "./../database/MONGO_DB.js";
import { hash } from "bcrypt";
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
config();

import APIResponse from './../utilities/APIResponse.js';

import { Request, Response } from "express";

import dotenv from 'dotenv';
import APIError from "../utilities/APIError.js";
dotenv.config();

export const signup = async (req: Request, res: Response) => {

    const username = req.body.username;
    const password = req.body?.password;

    if(!password){
        res.json(new APIError(
            400,
            "Password required"
        ))
        return;
    }

    const hashedPassword = await hash(password,10);
    try {
        const SECRET_KEY = process.env.SECRET_KEY;
        if(SECRET_KEY){
            const user = await new models.User({
                userName : username,
                Password : hashedPassword
            })
            user.save();
    
            const token = await jwt.sign({
                username : username,
            },SECRET_KEY);
        
            res.cookie('BCC', `Bearer ${token}`);
            res.json(new APIResponse(
                200,
                "User created successfully"
            ))
            return;
        } else {
            res.json(new APIError(
                500,
                "Internal server error"
            ))
            return;
        }
    } catch (error) {
        res.json(new APIError(
            500,
            "Internal server error"
        ))
        return;
    }

}