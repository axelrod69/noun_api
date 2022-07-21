const express = require("express");
const DB = require("../../db");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";

const controller = require("./controller");

router.route("/login").post(controller.userLogin);
router.route("/verify-otp").post(controller.verifyOtp);
router.route("/brand-name").get(controller.brandNameList);
router.route("/car-model/:carBrand").get(controller.carModel);
router.route("/car-sub-model").get(controller.carSubModel);
router.route("/slot-booking-by-date").get(controller.slotBookingByDate);

// verify token
function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        console.log(`middleware called`, token);
        jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                res.send({ result: "please provided valid token" });
            } else {
                next();
            }
        })
    } else {
        res.send({ result: "please add token with header" });
    }
}
module.exports = router;