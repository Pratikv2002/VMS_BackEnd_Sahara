import jwt from "jsonwebtoken";
import pool from "../config/db-config.js";
import queries from "../util/queries.js";
import bcrypt from 'bcrypt';

export const employeeSignUp = async (req, res) => {
    try {
        const {
            name,
            email,
            role,
            password
        } = req.body;

        pool.query(queries.addEmployee, [name, email, role, password], (err, results) => {
            if (err) throw err;
            if (results.insertId) {
                res.status(201).json({
                    status: 1,
                    data: {
                        msg: "Employee added successfully"
                    }
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const employeeSignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400)
        }
        pool.query(queries.get_employee, [email], async (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                console.log(process.env.JWT_SECRET_EMPLOYEE);
                const token = jwt.sign({ id: results[0].employee_id, email: email, expiry: 1234 }, process.env.JWT_SECRET_EMPLOYEE);
                res.status(200).json({
                    status: 1, data: {
                        token,
                        msg: "Signin successfull"
                    }
                });
            } else {
                return res
                    .status(401)
                    .json({ status: 0, data: { msg: "Employee with this email does not exist!" } });
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const gatekeeperSignUp = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        pool.query(queries.find_gatekeeper, [email], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.status(400).json({
                    status: false,
                    msg: "Gatekeeper already exist"
                })
            } else {
                pool.query(queries.add_gatekeeper, [name, email, password, phoneNumber], (err, results) => {
                    if (err) throw err;
                    if (results) {
                        res.status(201).json({
                            status: 1,
                            data: {
                                msg: "Gatekeeper added successfully"
                            }
                        })
                    }
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false
        })
    }
}

export const gatekeeperSignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        pool.query(queries.find_gatekeeper, [email], (err, results) => {
            if (err) throw err;

            if (results.length == 0) {
                res.status(401).json({
                    status: 0,
                    data: {
                        msg: "Gatekeeper with this email does not exist"
                    }
                })
            } else {
                if (results[0].password !== password) {
                    res.status(401).json({
                        status: 0,
                        data: {
                            msg: "Incorrect password"
                        }
                    })
                } else {
                    const token = jwt.sign({ id: results[0].gatekeeper_id, email: results[0].email }, process.env.JWT_SECRET_EMPLOYEE);
                    res.status(200).json({
                        status: 1,
                        data: {
                            email: email,
                            token: token
                        }
                    })
                }
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false
        })
    }
}
