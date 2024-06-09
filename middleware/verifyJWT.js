const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({ "message": "Unauthorized, token missing or wrong format" });
    }

    const accessToken = authHeader.split(" ")[1];

    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        function (error, decoded){
            if(error){
                return res.status(403).json({"message": "Forbidden, your access token is bad" });
            }
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            next();
        }
    );

}

module.exports = verifyJWT;