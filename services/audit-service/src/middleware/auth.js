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
}
// Middleware to restrict access to Management Representatives
const restrictToManagementRep = (req, res, next) => {
  const hasMRRole = req.user?.roles?.some((role) => {
    const roleName = typeof role === "string" ? role : role.name;
    return roleName?.toUpperCase() === "MR";
  });

  if (!hasMRRole) {
    console.log("User lacks MR role:", req.user.roles);
    return res.status(403).json({ error: "Management Representative access required" });
  }
  next();
};

// Middleware to restrict access to Admins
const restrictToAdmin = (req, res, next) => {
  const hasAdminRole = req.user?.roles?.some((role) => {
    const roleName = typeof role === "string" ? role : role.name;
    return roleName?.toUpperCase() === "ADMIN";
  });

  if (!hasAdminRole) {
    console.log("User lacks Admin role:", req.user.roles);
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = {
  authenticateToken,
  restrictToAdmin,
  restrictToManagementRep,
};