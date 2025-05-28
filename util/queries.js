const queries = {
    get_approved_visits: 'SELECT log_id,gatekeeper_id, visit_status, checkin_time, checkout_time, visitor_name, visitor_phone_no, visitor_email, employee_id, employee_id, reason, location_id, request_time from vw_approved_visits',
    get_pending_visits: 'SELECT log_id,gatekeeper_id, visit_status, checkin_time, checkout_time, visitor_name, visitor_phone_no, visitor_email, employee_id, employee_id, reason, location_id, request_time from vw_pending_visits',
    get_rejected_visits: 'SELECT log_id,gatekeeper_id, visit_status, checkin_time, checkout_time, visitor_name, visitor_phone_no, visitor_email, employee_id, employee_id, reason, location_id, request_time from vw_rejected_visits',

    get_approved_visits_today: 'SELECT log_id from vw_approved_visits where DATE(request_time)=?',
    get_pending_visits_today: 'SELECT log_id from vw_pending_visits where DATE(request_time)=?',
    get_rejected_visits_today: 'SELECT log_id from vw_rejected_visits where DATE(request_time)=?',
    get_completed_checkouts_today: `SELECT log_id from vw_exited_visits where visit_status='EXITED' and DATE(request_time)=?`,

    get_visits_by_dates: `
    SELECT VL.log_id, VL.gatekeeper_id, VL.visit_status, VL.checkin_time, VL.checkout_time, VL.visitor_name, VL.visitor_phone_no, VL.visitor_email, VL.employee_id, VL.employee_id, VL.reason, VL.location_id, VL.request_time, E.name as employeeName, E.email as employeeEmail, E.role as employeeRole from visit_logs as VL left join employees as E on VL.employee_id=E.employee_id where DATE(request_time)>=? AND DATE(request_time)<=?
    `,

    get_seven_days_data: `
            SELECT 
                dates.date as date,
                COALESCE(SUM(CASE WHEN visit_logs.visit_status = 'APPROVED' THEN 1 ELSE 0 END), 0) AS approved_count,
                COALESCE(SUM(CASE WHEN visit_logs.visit_status = 'PENDING' THEN 1 ELSE 0 END), 0) AS pending_count,
                COALESCE(SUM(CASE WHEN visit_logs.visit_status = 'REJECTED' THEN 1 ELSE 0 END), 0) AS rejected_count,
                COALESCE(SUM(CASE WHEN visit_logs.visit_status = 'EXITED' THEN 1 ELSE 0 END), 0) as checkout_count
            FROM 
                (
                    SELECT CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY AS date
                    FROM (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
                    CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS b
                    CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS c
                ) AS dates
            LEFT JOIN 
                visit_logs 
            ON 
                DATE(visit_logs.request_time) = dates.date
            WHERE 
                dates.date >= ?
            GROUP BY 
                dates.date
            ORDER BY 
                dates.date ASC
    `,

    find_gatekeeper: 'SELECT * from gatekeepers where email=?',
    get_pending_checkout: 'SELECT log_id,gatekeeper_id, visit_status, checkin_time, visitor_name, visitor_phone_no, visitor_email, employee_id, employee_id, reason, location_id, request_time  from vw_approved_visits where checkout_time is null',
    get_completed_checkouts: 'SELECT log_id from vw_approved_visits where checkout_time IS NOT null',
    get_employee_email: 'SELECT email from employees where employee_id=?',
    get_employee: 'SELECT * from employees where email=?',
    get_employee_by_id: 'SELECT * from employees where employee_id=?',
    get_employees: 'SELECT employee_id, name from employees',
    get_locations: 'SELECT location_id, location_name from locations',
    get_visit_log: ` SELECT vl.*, vt.name AS visitor_type FROM visit_logs vl LEFT JOIN visitor_types vt ON vl.visitor_type = vt.id WHERE vl.log_id = ?`,
    get_past_seven_days_visits: 'SELECT log_id,gatekeeper_id, visit_status, checkin_time, checkout_time, visitor_name, visitor_phone_no, visitor_email, employee_id, employee_id, reason, location_id, request_time from visit_logs where request_time>=? AND request_time<=?',
    get_digital_pass: `SELECT VL.*, E.name as employeeName, E.email as employeeEmail, E.role as employeeRole from visit_logs as VL left join employees as E on VL.employee_id=E.employee_id where VL.log_id=? AND visit_status='APPROVED'`,
    create_new_visit: `INSERT INTO visit_logs(visitor_name, visitor_email, visitor_phone_no, visitor_image, employee_id, reason, location_id, visit_status, visitor_type, total_people) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    add_gatekeeper: 'INSERT INTO gatekeepers(name,email,password,phone_no) values(?,?,?,?)',
    addEmployee: 'INSERT INTO employees(name,email,role,password) VALUES(?,?,?,?)',
    approve_visit: 'UPDATE visit_logs SET visit_status=?, checkin_time=? where log_id=?',
    reject_visit: 'UPDATE visit_logs SET visit_status=?, checkout_time=? where log_id=?',
    complete_checkout: `UPDATE visit_logs SET checkout_time=?, visit_status='EXITED' where log_id=?`,
    get_visitor_by_mobile: 'SELECT * FROM visitor WHERE mobile=?',

    add_visitor: `
        INSERT INTO visitor (name, email, mobile, aadhar_number, id_card, designation_id) 
        VALUES (?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            email = VALUES(email), 
            aadhar_number = VALUES(aadhar_number), 
            id_card = VALUES(id_card), 
            designation_id = VALUES(designation_id);
    `,
    get_designations: 'SELECT * FROM `designation` WHERE 1',
    // Visitor Types
    get_visitor_types: 'SELECT * FROM `visitor_types` WHERE 1',
    get_active_visitor_types: 'SELECT * FROM visitor_types WHERE is_active = TRUE',
    get_inactive_visitor_types: 'SELECT * FROM visitor_types WHERE is_active = FALSE',
    get_visitor_type_by_id: 'SELECT * FROM visitor_types WHERE id = ?',
    add_visitor_type: 'INSERT INTO visitor_types (name, is_active) VALUES (?, ?)',
    update_visitor_type: 'UPDATE visitor_types SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    activate_visitor_type: 'UPDATE visitor_types SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    deactivate_visitor_type: 'UPDATE visitor_types SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    delete_visitor_type: 'DELETE FROM visitor_types WHERE id = ?',


}

export default queries;