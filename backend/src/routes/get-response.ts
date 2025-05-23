import { Request, Response } from "express";
import { generate_response } from "../main-agent/main-agent.js";
import models from "./../database/MONGO_DB.js";
import APIError from "../utilities/APIError.js";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from "dotenv";
config();

interface customJWTPayload extends JwtPayload{
    username: string
}

export const get_response = async (req: Request, res: Response) => {

    const { input } = req.body;
    const bearer_token = req.cookies['BCC'];
    if (bearer_token) {
        if (bearer_token.split(" ").length == 2) {
            const token = bearer_token.split(" ")[1];
            const SECRET_KEY = process.env.SECRET_KEY;
            if (SECRET_KEY) {

                try {

                    const result = await jwt.verify(token, SECRET_KEY) as customJWTPayload
                    const username = result.username;

                    const result1 = await generate_response(input)
    
                    await models.User.updateOne({
                        userName: username
                    }, {
                        "$push": {
                            "Chats": {
                                "$each": [
                                    {
                                        "role": "User",
                                        "content": input
                                    },
                                    {
                                        "role": "AI",
                                        "content": result1
                                    }
                                ]
                            }
                        }
                    })
    
                    res.json({
                        msg: result1
                    })
                    
                } catch (error) {
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