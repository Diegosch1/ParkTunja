import jwt from 'jsonwebtoken';
import 'dotenv/config';

//validate token is not expired or empty before accessing another route
export const authRequired = (req, res, next) => {

    const {token} = req.cookies
    if(!token) return res.status(401).json({message: "No token found, authorization denied"})

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if(err) return res.status(401).json({message: "Invalid token"});

        req.user = user;        

        next();

    })

};

export const adminRequired = (req, res, next) => {
    
    const {token} = req.cookies
    if(!token) return res.status(401).json({message: "No token found, authorization denied"})

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if(err) return res.status(401).json({message: "Invalid token"});

        req.user = user;        
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Permission denied, admin required" });
        }

        next();

    })    
};