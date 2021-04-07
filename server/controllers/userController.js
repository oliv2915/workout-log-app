const router = require("express").Router();
const {UserModel} = require("../models");
const {UniqueConstraintError} = require("sequelize/");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { restart } = require("nodemon");

router.post("/register", async (req, res) => {
    const {username, password} = req.body.user;
    
    try {
        const user = await UserModel.create({ // create a user
            username,
            password: bcrypt.hashSync(password, 13)
        });

        let token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 *24});


        res.status(201).json({
            message: "User registered successfully",
            user: user,
            sessionToken: token
        })

    } catch (err) {

        if (err instanceof UniqueConstraintError) {
            res.status(409).json({
                message: "Username is already in use"
            })
        } else {
            res.status(500).json({
                message: "Registration Failed"
            })
        }
    }
})

router.post("/login", async (req, res) => {
    let {username, password} = req.body.user;

    try {
        let loginUser = await UserModel.findOne({ // find user
            where: {
                username: username
            }
        });

        if (loginUser) { // if user is found
            let passwordCompare = await bcrypt.compare(password, loginUser.password); // compare passwords

            if (passwordCompare) {
                // create a token
                let token = jwt.sign({id: loginUser.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});

                res.status(200).json({
                    message: "Logged in successfully",
                    user: loginUser,
                    sessionToken: token
                });
            } else { // passwords don't match
                res.status(401).json({
                    message: "Incorrect username or password"
                });
            }
        } else { // no user found
            restart.status(401).json({
                message: "Incorrect username or password"
            });
        }
    } catch (err) {
        res.status(500).json({error: err});
    }
})


module.exports = router;