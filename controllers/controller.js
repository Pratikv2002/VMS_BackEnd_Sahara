import pool from "../config/db-config.js";
import jwt from "jsonwebtoken";
import { approveEmailToVisitor, rejectEmailToVisitor, sendEmail, sendEmailToVisitor } from "../util/email.js";
import queries from "../util/queries.js";
import qrcode from 'qrcode'

export const createNewVisit = async (req, res) => {
    try {
        let { 
            visitor_name, visitor_email, visitor_phone_number, visitor_image, 
            employee_id, reason, location_id, visitor_type, total_people 
        } = req.body;

        total_people = total_people || 1;

        pool.query(
            queries.create_new_visit, 
            [
                visitor_name, visitor_email, visitor_phone_number, visitor_image, 
                employee_id, reason, location_id, 'PENDING', visitor_type, total_people
            ], 
            async (err, results) => {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).json({ status: false, message: "Database error" });
                }

                const newVisitId = results.insertId;
                console.log("New Visit Created: ", results);

                // Fetch employee details
                pool.query(queries.get_employee_by_id, [employee_id], async (err, results) => {
                    if (err || !results || results.length === 0) {
                        console.error("No Employee Found with ID:", employee_id);
                        return res.status(404).json({ status: false, message: "Employee not found" });
                    }

                    let employee = results[0];
                    let validationToken = jwt.sign(
                        { id: employee_id, email: employee.email, expiry: 1234, log_id: newVisitId },
                        process.env.JWT_SECRET_EMPLOYEE
                    );

                    console.log("Validation token:", validationToken);
                    await sendEmail(employee.email, newVisitId, visitor_image, visitor_name, validationToken);
                    await sendEmailToVisitor(visitor_email, employee.name);
                });

                // Insert visitor details
                const visitor = { 
                    name: visitor_name, 
                    email: visitor_email, 
                    mobile: visitor_phone_number 
                };
                postVisitorFun(visitor);

                res.status(200).json({ status: true });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false });
    }
};



export const approveVisit = async (req, res) => {
    try {
        const id = req.log_id;
        if (!id) {
            res.status(400).json({
                status: false
            })
            return
        }
        pool.query(queries.approve_visit, ['APPROVED', new Date(), id], async (err, results) => {
            if (err) throw err;
            console.log(results);
            if (results.affectedRows > 0) {
                pool.query(queries.get_visit_log, [id], async (err, results) => {
                    if (err) throw err;
                    if (results.length > 0) {
                        await approveEmailToVisitor(results[0].visitor_email, req.params.token)
                        res.status(200).json({
                            status: true,
                            msg: "Approved statusfully!!"
                        })
                    }
                })
            } else {
                res.status(404).json({
                    status: false,
                    msg: "Invalid id!"
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

export const verifyToken = async (req, res) => {
    try {
        res.status(200).json({
            status: 1
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const rejectVisit = async (req, res) => {
    try {
        const id = req.log_id;
        if (!id) {
            res.status(400).json({
                status: false
            })
            return
        }
        pool.query(queries.reject_visit, ['REJECTED', new Date(), id], async (err, results) => {
            if (err) throw err;
            console.log(results);
            if (results.affectedRows > 0) {
                pool.query(queries.get_visit_log, [id], async (err, results) => {
                    if (err) throw err;
                    if (results.length > 0) {
                        await rejectEmailToVisitor(results[0].visitor_email)
                        res.status(200).json({
                            status: true,
                            msg: "REJECTED successfully!!"
                        })
                    }
                })

            } else {
                res.status(404).json({
                    status: false,
                    msg: "Invalid log id!"
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

export const countVisits = async (req, res) => {
    try {
        const response = {}
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        pool.query(queries.get_approved_visits_today, [formattedDate], async (err, approvedResults) => {
            if (err) throw err;
            response.approvedVisits = approvedResults;
            pool.query(queries.get_pending_visits_today, [formattedDate], async (err, pendingResults) => {
                if (err) throw err;
                response.pendingVisits = pendingResults;
                pool.query(queries.get_rejected_visits_today, [formattedDate], async (err, rejectedResults) => {
                    if (err) throw err;
                    response.rejectedVisits = rejectedResults;
                    pool.query(queries.get_completed_checkouts_today, [formattedDate], (err, checkoutResults) => {
                        if (err) throw err
                        res.status(200).json({
                            status: 1,
                            data: {
                                approvedCount: approvedResults.length || 0,
                                pendingCount: pendingResults.length || 0,
                                rejectedCount: rejectedResults.length || 0,
                                checkoutCount: checkoutResults.length || 0,
                            }

                        })
                    })

                })
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const pendingCheckoutCount = async (req, res) => {
    try {
        pool.query(queries.get_pending_checkout, (err, results) => {
            if (err) throw err;
            res.status(200).json({
                status: 1,
                data: {
                    count: results.length,
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const markCheckoutComplete = async (req, res) => {
    try {
        const { id } = req.body;
        const checkoutTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        pool.query(queries.complete_checkout, [checkoutTime, id], (err, results) => {
            if (err) throw err;
            console.log(results);
            if (results) {
                res.status(201).json({
                    status: 1,
                    data: {
                        msg: "Checkout completed."
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

export const approvedVisitsCount = async (req, res) => {
    try {
        pool.query(queries.get_approved_visits, (err, results) => {
            if (err) throw err;

            res.status(200).json({
                status: 1,
                data: {
                    count: results.length,
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const pendingVisitsCount = async (req, res) => {
    try {
        pool.query(queries.get_pending_visits, (err, results) => {
            if (err) throw err;
            res.status(200).json({
                status: 1,
                data: {
                    count: results.length,
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const rejectedVisitsCount = async (req, res) => {
    try {
        pool.query(queries.get_rejected_visits, (err, results) => {
            if (err) throw err;
            res.status(200).json({
                status: 1,
                data: {
                    count: results.length,
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const getEmployees = async (req, res) => {
    try {
        pool.query(queries.get_employees, (err, results) => {
            if (err) throw err;
            res.status(200).json({
                status: 1,
                data: {
                    count: results.length,
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const getLocations = async (req, res) => {
    try {
        pool.query(queries.get_locations, (err, results) => {
            if (err) throw err;
            res.status(200).json({
                status: 1,
                data: {
                    count: results.length,
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const getDesignations = async (req, res) => {
    try {
        pool.query(queries.get_designations, (err, results) => {
            if (err) throw err;
            res.status(200).json({
                status: 1,
                data: {
                    count: results.length,
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}


export const getVisitLogs = async (req, res) => {
    try {
        const logId = req.params.id
        const visitToken = req.params.token
        console.log("here")
        const { id } = jwt.decode(visitToken, process.env.JWT_SECRET_EMPLOYEE, true);
       

        pool.query(queries.get_visit_log, [logId], (err, results) => {
            console.log("results",results)

            if (err) throw err;
            if (results.length == 0 || results[0].employee_id !== id) {
                res.status(403).json({
                    status: 0,
                    data: {
                        msg: "Invalid log id"
                    }
                })
                return;
            }
            pool.query(queries.get_visit_log, [logId], (err, results) => {
                if (err) throw err;
                res.status(200).json({
                    status: 1,
                    data: {
                        ...results[0]
                    }
                })
            })
        })




    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const getSevenDaysVisits = async (req, res) => {
    try {
        const todaysDate = new Date();
        const sevenDaysAgo = new Date(todaysDate.getTime() - (7 * 24 * 60 * 60 * 1000));
        console.log(sevenDaysAgo);

        const today = new Date();
        const year = sevenDaysAgo.getFullYear();
        const month = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
        const day = String(sevenDaysAgo.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        pool.query(queries.get_seven_days_data, [formattedDate], (err, results) => {
            if (err) throw err;
            console.log(results);
            res.status(200).json({
                status: 1,
                data: {
                    results
                }
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const getDigitalPass = async (req, res) => {
    try {
        const logId = req.log_id; 
        if (!logId) {
            return res.status(400).json({ status: 0, message: "Log ID is required" });
        }

        pool.query(queries.get_digital_pass, [logId], async (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                return res.status(404).json({ status: 0, message: "Digital pass not found" });
            }

            const digitalPass = results[0];

            // Check expiration
            if (digitalPass.checkout_time && new Date(digitalPass.checkout_time) < new Date()) {
                return res.status(400).json({ status: 0, message: "Digital pass has expired" });
            }

            // Generate QR Code with `log_id`
            let validationToken = jwt.sign({logId}, process.env.JWT_SECRET_EMPLOYEE);
            console.log(validationToken);
            const qrCodeData = validationToken
            const qrCodeImage = await qrcode.toDataURL(qrCodeData);

            digitalPass.qrCode = qrCodeImage

            res.status(200).json({
                status: 1,
                data: {
                    digitalPass,
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 0,
            message: "Internal Server Error"
        });
    }
};

export const postEmployees = async(req,res)=>{
    try {
        // Extract employee data from the request body
        const { name, email, role, password } = req.body;

        pool.query(queries.addEmployee, [name, email, role, password], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: 'Error adding employee',
                    error: err.message,
                });
            }
            return res.status(201).json({
                message: 'Employee added successfully',
                employeeId: result.insertId, 
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error in employee creation',
            error: error.message,
        });
    }
}
export const getVisits = async (req, res) => {
    try {
        const { fromDate, toDate } = req.params

        pool.query(queries.get_visits_by_dates, [fromDate, toDate], (err, results) => {
            if (err) throw err;
            res.status(200).json({
                status: 1,
                data: {
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const getVisitorByMobile = async (req, res) => {
    try {
        const mobile = req.params.mobile
        pool.query(queries.get_visitor_by_mobile, [mobile], (err, results) => {
            if (err) throw err;
            res.status(200).json({
                status: 1,
                data: {
                    results
                }
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export const postVisitor = async(req,res)=>{
    try {
        
        const { name, email, mobile } = req.body;

        pool.query(queries.add_visitor, [name, email, mobile], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: 'Error adding visitor',
                    error: err.message,
                });
            }
            return res.status(201).json({
                message: 'visitor added successfully',
                employeeId: result.insertId, 
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error in visitor creation',
            error: error.message,
        });
    }
}
export const postVisitorFun = async (visitor) => {
    try {
        const { name, email, mobile, aadhar_number, id_card_number, designation_id } = visitor;

        pool.query(queries.add_visitor, 
            [name, email, mobile, aadhar_number, id_card_number, designation_id], 
            (err, result) => {
                if (err) {
                    console.error(err);
                    return false;
                }
                return true;
            }
        );
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const verifyPass = (req,res)=>{
    try {
        const token = req.params?.token; 
        if (!token) {
            return res.status(400).json({ status: 0, message: "token is required" });
        }
       const { logId } = jwt.decode(token, process.env.JWT_SECRET_EMPLOYEE, true);
       console.log(logId);
        pool.query(queries.get_visit_log, [logId], async (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                return res.status(200).json({ status: 0, message: "Digital pass not found" });
            }

            const digitalPass = results[0];

            // Check expiration
            if (digitalPass.visit_status=="EXITED") {
                return res.status(200).json({ status: 0, message: "Digital pass has expired" });
            }

            // Generate QR Code with `log_id`
            const qrCodeData = JSON.stringify({ log_id: logId });
            const qrCodeImage = await qrcode.toDataURL(qrCodeData);

            digitalPass.qrCode = qrCodeImage

            res.status(200).json({
                status: 1,
                message:"Verified.",
                data:{
                    log_id: logId
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 0,
            message: "Internal Server Error"
        });
    }
    
}

export const getAllVisitorTypes = (req, res) => {
    pool.query(queries.get_visitor_types, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: 'Failed to fetch visitor types',
                details: err.message
            });
        }
        res.status(200).json({
            status: 1,
            data: {
                count: results.length,
                results
            }
        });
    });
};


  // Get a single visitor type by ID
export const getVisitorTypeById = (req, res) => {
  pool.query(queries.get_visitor_type_by_id, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching visitor type', details: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Visitor type not found' });
    }
    res.status(200).json(results[0]);
  });
};


  // Add a new visitor type
export const addVisitorType = (req, res) => {
  const { name, is_active = true } = req.body;
  pool.query(queries.add_visitor_type, [name, is_active], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error adding visitor type', details: err.message });
    }
    res.status(201).json({ message: 'Visitor type added', id: result.insertId });
  });
};


  // Update a visitor type
export const updateVisitorType = (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  pool.query(queries.update_visitor_type, [name, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating visitor type', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Visitor type not found' });
    }
    res.status(200).json({ message: 'Visitor type updated' });
  });
};


  // Activate visitor type
export const activateVisitorType = (req, res) => {
  const { id } = req.params;
  pool.query(queries.activate_visitor_type, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error activating visitor type', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Visitor type not found' });
    }
    res.status(200).json({ message: 'Visitor type activated' });
  });
};


  // Deactivate visitor type
export const deactivateVisitorType = (req, res) => {
  const { id } = req.params;
  pool.query(queries.deactivate_visitor_type, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deactivating visitor type', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Visitor type not found' });
    }
    res.status(200).json({ message: 'Visitor type deactivated' });
  });
};


  // Delete visitor type
export const deleteVisitorType = (req, res) => {
  const { id } = req.params;
  pool.query(queries.delete_visitor_type, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting visitor type', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Visitor type not found' });
    }
    res.status(200).json({ message: 'Visitor type deleted' });
  });
};
