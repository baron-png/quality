require("dotenv").config(); 
const { connectDB } = require("./config/db");
const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const documentRoutes = require("./routes/index");

const app = express();


app.use(cors({
  origin: "*", 
  
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());


app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "document-service" });
});


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
      departmentId: decoded.departmentId,
    };
    console.log("Decoded JWT:", req.user);
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};


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




app.use("/document/api", documentRoutes);

const PORT = process.env.PORT || 5002;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Document Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server due to database connection error:", error);
    process.exit(1);
  });
