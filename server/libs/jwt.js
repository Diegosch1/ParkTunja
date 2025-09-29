import 'dotenv/config';
import jwt from "jsonwebtoken";

export function createAccessToken(payload) {

    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.TOKEN_SECRET,
            { expiresIn: "1d" }, //token expires in 1 day
            (err, token) => {
                if (err) reject(err);
                resolve(token)
            })
    })


}