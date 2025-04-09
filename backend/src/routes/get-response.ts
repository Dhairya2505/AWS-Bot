import { Request, Response } from "express";
import { generate_response } from "../main-agent/main-agent.js";

export const get_response = async ( req: Request, res: Response ) => {

    const { input } = req.body;
    const result = await generate_response(input)
    res.json({
        msg: result
    })

}