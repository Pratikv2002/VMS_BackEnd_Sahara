import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("auth");
        console.log(token);
        const { id, email, expiry } = jwt.decode(token, process.env.JWT_SECRET_EMPLOYEE, true);
        console.log(id, email, expiry);

        if (!id || !email) {
            res.status(403).json({
                status: 0,
                data: {
                    msg: "Invalid auth token"
                }
            })
            return;
        } else {
            req.userId = id
            next();
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0
        })
    }
}

export default authMiddleware;