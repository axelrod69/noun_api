const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";

const controller = require("./controller");

router.route("/login").post(controller.adminLogin);
router.route("/cars").get(verifyAdminToken, controller.listAllCars);
router.route("/cars").post(verifyAdminToken, controller.addCar);

// verify access token only for provider
function verifyAdminToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        jwt.verify(token, jwtKey, (err, data) => {
            if (err) {
                res.send({
                    status: "warning",
                    message: "Please provide valid token!"
                });
            } else {
                if (data['role'] == "admin") {
                    req.jwtAdmin = data;
                    next();
                } else {
                    res.send({
                        status: "warning",
                        message: "Please provide valid token!"
                    });
                }
            }
        })
    } else {
        res.send({
            status: "warning",
            message: "Please provide token!"
        });
    }
}

module.exports = router;