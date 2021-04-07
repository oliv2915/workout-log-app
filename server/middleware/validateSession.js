const jwt = require("jsonwebtoken");
const { UserModel } = require("../models");

const validateJWT = async (req, res, next) => {
    // check to see if HTTP method OPTIONS was sent
    if (req.method == "OPTIONS") {
        next(); // nothing to do here

    } else if (req.headers.authorization && req.headers.authorization.includes("Bearer")) { // check to see if we have an authorization header and if the header also includes "Bearer"
        const { authorization } = req.headers; // access authorization data
        // if authorization header does not include a token, set payload as undefined
        const payload = authorization ? jwt.verify(authorization.includes("Bearer") ? authorization.split(" ")[1] : authorization, process.env.JWT_SECRET) : undefined;
       
        if (payload) { // check to see if we have a token

            let foundUser = await UserModel.findOne({ // find user based on id found in the payload
                where: {id: payload.id}
            });
            
            if (foundUser) { // if user is found
                
                req.user = foundUser; // add user data to the req
                next();

            } else { // no user found
                res.status(400).send({
                    message: "Not Authorized"
                });
            }

        } else { // token is invalid
            res.status(401).send({
                message: "Invalid Token"
            });
        }
    } else { // access forbidden
        res.status(403).send({
            message: "Forbidden"
        });
    }
};

module.exports = validateJWT;