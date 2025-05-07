import { Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import models from './../database/MONGO_DB.js'
import { config } from "dotenv";
import APIError from "../utilities/APIError.js";
config();

interface customJWTPayload extends JwtPayload {
    username: string
}

export const get_chats = async (req: Request, res: Response) => {

    const bearer_token = req.cookies['BCC'];
    if (bearer_token) {
        if (bearer_token.split(" ").length == 2) {
            const token = bearer_token.split(" ")[1];
            const SECRET_KEY = process.env.SECRET_KEY;
            if (SECRET_KEY) {

                try {

                    const result = await jwt.verify(token, SECRET_KEY) as customJWTPayload
                    const username = result.username;

                    const user = await models.User.findOne({
                        userName: username
                    })
                    if (user){
                        res.status(200).json({
                            Chats: user.Chats
                        })    
                    } else {
                        res.json(new APIError(
                            401,
                            "Unauthorized"
                        ))
                    }

                } catch {
                    res.json(new APIError(
                        500,
                        "Internal server error"
                    ))
                }
            } else {
                res.json(new APIError(
                    500,
                    "Internal server error"
                ))
            }
        } else {
            res.json(new APIError(
                401,
                "Unauthorized"
            ))
        }
    } else {
        res.json(new APIError(
            401,
            "Unauthorized"
        ))
    }

}