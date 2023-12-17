// libraries
const jwt = require("jsonwebtoken");

const requireAuth = async (req, res, next) => {
    const token = req.headers.token;
    if (token) {
        await jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                res.status(401).json({message: "توکن شما معتبر نمی باشد", status: "failure"});
            } else {
                res.locals.user = decodedToken.user;
                next();
            }
        })
    } else {
        res.status(401).json({message: "شما دسترسی ندارید ابتدا وارد شوید", status: "failure"});
    }
}

module.exports = {
    requireAuth
}
