// libraries
const {rateLimit} = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    headers: true,
    keyGenerator: (req, res) => req.ip,
});

module.exports = limiter;