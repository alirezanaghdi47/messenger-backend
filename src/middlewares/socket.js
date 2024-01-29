// libraries
const jwt = require("jsonwebtoken");

const requiredAuth = async (socket, next) => {
    const {token} = socket.handshake.query;

    await jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            socket.disconnect();
        } else {
            next();
        }
    });
};

module.exports = {
    requiredAuth
}