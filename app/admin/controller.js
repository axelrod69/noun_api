const DB = require("../../db");
const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";

exports.adminLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Something went wrong"
                });
        } else {
            let sql = "SELECT * FROM admin WHERE adminEmail = ? && adminPassword = ?";
            DB.query(sql, [email, password], async (err, result) => {
                if (err) {
                    return res
                        .status(200)
                        .json({
                            status: "warning",
                            message: "Something went wrong"
                        });
                }
                if (result.length == 1) {
                    let row = result[0];
                    jwt.sign({ adminKey: row['adminKey'], adminEmail: row['adminEmail'], role: 'admin' }, jwtKey, { expiresIn: "24h" }, (err, token) => {
                        if (err) {
                            return res
                                .status(200)
                                .json({
                                    status: "warning",
                                    message: "Something went wrong!"
                                });
                        }
                        return res
                            .status(202)
                            .json({
                                status: "success",
                                message: "Login Success!",
                                data: result,
                                token: token
                            });
                    })
                } else {
                    return res
                        .status(200)
                        .json({
                            status: "warning",
                            message: "Invalid login details",
                            data: []
                        });
                }
            });
        }
    })
}

// add car 
exports.addCar = async (req, res) => {
    // let adminKey = req.jwtAdmin['adminKey'];
    let adminKey = req.jwtAdmin['adminKey'];
    let chargingPortKey = req.body.chargingPortKey;
    let carBrand = req.body.carBrand;
    let carModel = req.body.carModel;
    let carSubModel = req.body.carSubModel;
    let carImage = req.files.carImage[0].filename;

    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Something went wrong"
                });
        } else {
            let query = "INSERT INTO `car_details`(`adminKey`, `chargingPortKey`, `carBrand`, `carModel`, `carSubModel`, `carImage`) VALUES (?,?,?,?,?,?)";
            DB.query(query, [adminKey, chargingPortKey, carBrand, carModel, carSubModel, carImage], async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                return res
                    .status(201)
                    .json({
                        status: "success",
                        message: `Id ${result.insertId} Inserted successfull`,
                        data: result,
                    });
            });
        }
    })
}

// listAllCars
exports.listAllCars = async (req, res) => {
    let adminKey = req.jwtAdmin['adminKey'];
    DB.query("SELECT * FROM car_details WHERE adminKey=?", [adminKey], async (err, result) => {
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: `Something went wrong`
                });
        }
        if (result.length > 0) {
            return res
                .status(200)
                .json({
                    status: "success",
                    message: `Found ${result.length} data! Successfull`,
                    data: result
                });
        } else {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Data not found",
                    data: []
                });
        }
    })
}
