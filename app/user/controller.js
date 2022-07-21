const DB = require("../../db");
const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";
const { json } = require("express/lib/response");

exports.userLogin = async (req, res) => {
    let phone = req.body.phone;
    let OTP = Math.floor(1000 + Math.random() * 9000);
    let otpDura = 600000;
    let currentTimeMillis = new Date().getTime();
    let otpExpiredAt = currentTimeMillis + otpDura;

    const checkUser = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let sql = "SELECT id, name, email, role FROM users WHERE phone = ? ";
            var test = DB.query(sql, [phone], async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                    if (err) {
                        console.log(`err ccc`);
                    }
                    console.log(`Token: ${token}`);

                    if (err) throw err;
                    console.log(result);
                    if (result.length == 1) {
                        result.map((e) => {
                            console.log(`Your ID is ${e.id}`);
                            let id = e.id;
                            DB.query(`UPDATE users SET otp=?, otpExpiredAt=? WHERE id=?`, [OTP, otpExpiredAt, id])
                        })

                        console.log(`Your OTP is ${OTP}`);
                        return res
                            .status(202)
                            .json({
                                status: "success",
                                message: "Phone number already registered",
                                otp: `Your OTP is ${OTP}`,
                            });
                    } else {
                        let phone = req.body.phone;
                        let role = "customer";
                        let otp = OTP;
                        let created_at = new Date();
                        let updated_at = new Date();

                        let sql =
                            "INSERT INTO users (phone, otp, otpExpiredAt, createdAt, updatedAt, role) VALUES (?,?,?,?,?,?)";
                        DB.query(
                            sql,
                            [
                                phone,
                                otp,
                                otpExpiredAt,
                                created_at,
                                updated_at,
                                role,
                            ],
                        )
                        console.log(`This ${phone} number not registered in our database`);
                        console.log(`Your OTP is ${OTP}`);
                        return res
                            .status(201)
                            .json({
                                status: "success",
                                message: `This ${phone} number registered in our database`,
                                otp: `Your OTP is ${OTP}`
                            });
                    }
                })
            });
        }
    })
}

// verifyOtp
exports.verifyOtp = async (req, res) => {
    let phone = req.body.phone;
    let otp = req.body.otp;
    const checkUser = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let sql = "SELECT * FROM users WHERE phone = ? && otp= ?";
            var test = DB.query(sql, [phone, otp], async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                    if (err) {
                        console.log(`err ccc`);
                    }
                    console.log(`Token: ${token}`);

                    if (err) throw err;
                    console.log(result);
                    if (result.length == 1) {
                        result.map((e) => {
                            console.log(`Your ID is ${e.id}`);
                        })
                        console.log(`OTP matched`);
                        console.log(req.cookies);

                        return res
                            .status(202)
                            .cookie("userData", result, "2d")
                            .json({
                                status: "success",
                                message: "OTP matched",
                                token: token,
                                userData: result,
                                // serviceProviderData: req.cookies,
                            })
                    } else {
                        console.log(`Otp dos't matched`);
                        return res
                            .status(201)
                            .cookie("userData", result, "2d")
                            .json({
                                status: "warning",
                                message: `Otp dos't matched`,
                                userData: result,
                                // serviceProviderData: req.cookies,
                            });
                    }
                })
            });
        }
    })
}

// brandNameList
exports.brandNameList = async (req, res) => {

    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let sql = `SELECT carKey,carBrand,createdAt,updatedAt,status FROM car_details WHERE status='active' GROUP BY carBrand`;
            DB.query(sql, async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                if (err) throw err;
                console.log(result);
                if (result.length > 0) {
                    result.map((e) => {
                        console.log(`Data found`);
                    })

                    return res
                        .status(202)
                        .json({
                            status: "success",
                            message: "Data found",
                            data: result,
                        })
                } else {
                    return res
                        .status(201)
                        .json({
                            status: "warning",
                            message: `Data not found`,
                            data: [],
                        });
                }
            });
        }
    })
}

// brandNameList
exports.carModel = async (req, res) => {

    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let carBrand = req.params.carBrand;
            let sql = `SELECT carKey,carModel,createdAt,updatedAt,status FROM car_details WHERE status='active' AND carBrand='${carBrand}' GROUP BY carModel`;
            DB.query(sql, async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                if (err) throw err;
                console.log(result);
                if (result.length > 0) {
                    result.map((e) => {
                        console.log(`Data found`);
                    })

                    return res
                        .status(202)
                        .json({
                            status: "success",
                            message: "Data found",
                            data: result,
                        })
                } else {
                    return res
                        .status(201)
                        .json({
                            status: "warning",
                            message: `Data not found`,
                            data: []
                        });
                }
            });
        }
    })
}

// carSubModel
exports.carSubModel = async (req, res) => {

    const checkUser = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let carBrand = req.query.carBrand;
            let carModel = req.query.carModel;
            let sql = `SELECT carKey,carSubModel,carImage,createdAt,updatedAt,status FROM car_details WHERE status='active' AND carBrand='${carBrand}' AND carModel='${carModel}' GROUP BY carSubModel`;
            var test = DB.query(sql, async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                if (err) throw err;
                console.log(result);
                if (result.length > 0) {
                    result.map((e) => {
                        console.log(`Data found`);
                    })

                    return res
                        .status(202)
                        .json({
                            status: "success",
                            message: "Data found",
                            data: result
                        })
                } else {
                    return res
                        .status(201)
                        .json({
                            status: "warning",
                            message: `Data not found`,
                            data: [],
                        });
                }
            });
        }
    })
}

// slotBookingByDate
exports.slotBookingByDate = async (req, res) => {

    const checkUser = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let stationKey = req.query.stationKey;
            let bookingDate = req.query.bookingDate;
            let isBooking = `SELECT * FROM booking WHERE stationKey='1' AND bookingDate='2022-06-23'`;
            // let isBooking = `SELECT * FROM booking WHERE stationKey='${stationKey}' AND bookingDate='${bookingDate}'`;
            DB.query(isBooking, async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                if (err) throw err;
                if (result.length > 0) {
                    result.map((sl) => {
                        console.log(sl['slotKey']);

                        // ********************************
                        let sql = `SELECT * FROM slot`;
                        var test = DB.query(sql, async (err, result) => {
                            if (err) {
                                return res.status(400).json({ err });
                            }
                            if (err) throw err;
                            // console.log(result[0]['slotNo']);
                            if (result.length > 0) {
                                result.map((e) => {
                                    console.log(e['slotKey']);
                                    if (e['slotKey'] === sl['slotKey']) {
                                        console.log('slot match');
                                    } else {
                                        console.log('slot not match');
                                    }
                                })

                                return res
                                    .status(202)
                                    .json({
                                        status: "success",
                                        message: "Data found",
                                        data: result,
                                    })
                            } else {
                                return res
                                    .status(201)
                                    .json({
                                        status: "warning",
                                        message: `Data not found`,
                                        data: [],
                                    });
                            }
                        });
                        // ********************************
                        return res
                            .status(202)
                            .json({
                                status: "success",
                                message: "Data found",
                                data: result,
                            })
                    })
                } else {
                    return res
                        .status(201)
                        .json({
                            status: "warning",
                            message: `Data not found`,
                            data: [],
                        });
                }
            });
        }
    })
}  