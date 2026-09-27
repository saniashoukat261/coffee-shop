// Blocks a route unless a customer is logged in.
function requireUser(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Please log in to continue.' });
}

module.exports = requireUser;
