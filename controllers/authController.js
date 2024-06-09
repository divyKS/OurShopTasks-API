const User = require('../models/User');
const Note = require('../models/Note');
const mongoose = require('mongoose');
const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt  = require('jsonwebtoken');

const login = expressAsyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({"message": "Both fields have to be filled"});
    }

    const foundUser = await User.findOne({"username": username}).exec();
    
    if(!foundUser){
        return res.status(401).json({ "message": "Unauthorized, user does not exist" });
    }

    const passwordMatches = await bcrypt.compare(password, foundUser.password);

    if(!passwordMatches){
        return res.status(401).json({ "message": "Unauthorized, the username or password is incorrect" });
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        // 30s
        { expiresIn: "5m" }
    );

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        //  2min, 120s
        { expiresIn: "5m" }
    );

    // Sets a cookie with name (name) and value (value) to be sent along with the response
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 300 * 1000 // same as refresh token
    });

    // client does not get to set the refresh token, that is done by the server
    // but when it sends request to /refresh, then we make it available
    res.json({ "accessToken": accessToken });

});

const refresh = expressAsyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if(!cookies || !cookies.jwt){
        return res.status(401).json({ message: 'Unauthorized, cookie not found' });
    }
    
    // refreshToken that the server had created above and provided to the client via the response
    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        expressAsyncHandler( async (error, decoded) => {
            if(error){
                return res.status(403).json({ "messgae": "Forbidden, bad refreshToken provided" });
            }
            
            const foundUser = await User.findOne({ "username": decoded.username }).exec();

            if(!foundUser){
                return res.status(401).json({ "message": "Unauthorized, something up with your refreshToken cookie" });
            }

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "5m" }
            );

            // still inside the jwt.verify
            return res.json({ accessToken });

        })
    );

});

const logout = expressAsyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies || !cookies.jwt){
        // if i do sendStatus(204) then the json wont be there since it means no content, so the client wont expect a response body 
        // with 204, i cant send anything back
        // return res.status(204).json({message: 'Cookie was already removed'}); //No content but successful
        return res.status(204).end();
    }
        
    // not writing the max age otherwise only contents are deleted
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None'});

    res.status(200).json({ message: 'Cookie cleared' }); // default status is 200
});

module.exports = { login, refresh, logout };