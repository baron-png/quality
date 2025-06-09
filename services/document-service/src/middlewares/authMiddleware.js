// Middleware to authenticate and extract userId from JWT
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.error("No token provided in Authorization header");
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = {
      userId: decoded.userId,
      roles: Array.isArray(decoded.roles)
        ? decoded.roles.map(role => typeof role === "string" ? { name: role } : role)
        : Array.isArray(decoded.roleNames)
        ? decoded.roleNames.map(role => ({ name: role }))
        : [],
      tenantId: decoded.tenantId,
      departmentId: decoded.departmentId, // Add if available in JWT
    };
    console.log("Decoded JWT:", req.user); // Log for debugging
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;