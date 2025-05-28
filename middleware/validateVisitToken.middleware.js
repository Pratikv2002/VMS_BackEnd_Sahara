import jwt from "jsonwebtoken";

const validateToken = async (req, res, next) => {
    try {
        const visitToken = req.params.token;

        const { id, email, expiry, log_id } = jwt.decode(visitToken, process.env.JWT_SECRET_EMPLOYEE, true);
        console.log(id, email, expiry, log_id);
        if (!id) {
            res.status(403).json({
                status: 0,
                data: {
                    msg: "Invalid token"
                }
            })
            return;
        } else {
            req.log_id = log_id
            next();
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export default validateToken