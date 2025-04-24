import APIError from './../utilities/APIError.js';
import models from './../database/MONGO_DB.js';
import { NextFunction, Request, Response } from 'express';

const UserDuplicacy = async (req: Request, res: Response, next: NextFunction) => {

    try {
        
        const username = req.body?.username;
    
        if(!username){
            res.json(new APIError(
                400,
                "Username required"
            ))
            return;
        }
    
        const user = await models.User.findOne({
            userName : username
        });

        if(user){
            res.json(new APIError(
                409,
                "Username taken"
            ))
            return;
        }else{
            next();
        }

    } catch (error) {
        res.json(new APIError(
            500,
            "Internal server error"
        ))
        return;
    }
    

}

export default UserDuplicacy;