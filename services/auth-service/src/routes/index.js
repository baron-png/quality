const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const { loginLimiter, forgotPasswordLimiter, resendOTPLimiter } = require('../middleware/rateLimiter');
const { syncDepartment } = require('../controllers/departmentController');

// -------------------
// Postman Test Guide for Authentication Service:
// -------------------

// 1. Register a user
//    - Method: POST
//    - URL: http://localhost:PORT/register
//    - Body: JSON
//      {
//        "email": "user@example.com",
//        "password": "yourpassword",
//        "roleIds": ["<role-uuid>"],
///        "tenantId": "<tenant-uuid>",
//        "tenantName": "Tenant Name",
//        "firstName": "First",
//        "lastName": "Last",
//        "departmentId": "<department-uuid>" // optional
//      }

// 2. Login to get Bearer token
//    - Method: POST
//    - URL: http://localhost:PORT/login
//    - Body: JSON
//      {
//        "email": "user@example.com",
//        "password": "yourpassword"
//      }
//    - Response: { "accessToken": "...", ... }
//    - Use the "accessToken" as Bearer token for all protected endpoints

// 3. Get current user info (requires Bearer token)
//    - Method: GET
//    - URL: http://localhost:PORT/me
//    - Headers: Authorization: Bearer <accessToken>

// 4. Forgot password
//    - Method: POST
//    - URL: http://localhost:PORT/forgot-password
//    - Body: JSON
//      { "email": "user@example.com" }

// 5. Reset password
//    - Method: POST
//    - URL: http://localhost:PORT/reset-password
//    - Body: JSON
//      { "token": "<reset-token>", "password": "newpassword" }

// 6. Refresh token
//    - Method: POST
//    - URL: http://localhost:PORT/refresh-token
//    - Body: JSON
//      { "refreshToken": "<refresh-token>" }

// 7. Verify OTP
//    - Method: POST
//    - URL: http://localhost:PORT/verify-otp
//    - Body: JSON
//      { "email": "user@example.com", "otp": "123456" }

// 8. Resend OTP
//    - Method: POST
//    - URL: http://localhost:PORT/resend-otp
//    - Body: JSON
//      { "email": "user@example.com" }

// Example route for login
router.post('/login', loginLimiter, authController.login);

// Example route for registration
router.post('/register', authController.register);

// Add the /me route
router.get("/me", authenticateToken, authController.getCurrentUser);

router.post('/tenants', authController.syncTenant);

// Route for verifying OTP
router.post('/verify-otp', authController.verifyOTP);

// Route for resending OTP
router.post('/resend-otp', resendOTPLimiter, authController.resendOTP);

router.get('/users/:id', authController.getUserById);

// Route for resetting password
router.post('/reset-password', authController.resetPassword);

// Route for refreshing token
router.post('/refresh-token', authController.refreshToken);

// Route for logout
router.post('/logout', authController.logout);

router.get("/users", authController.getUsersByRoleAndTenant);

// Route for forgot password
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);

// Add the route for creating roles
router.post('/roles', authController.createRole);
router.get('/roles', authController.getAllRoles);
router.post('/assign-roles', authController.assignRoles);

// Route for deleting account
router.post('/delete-account', authController.deleteAccount);

// Route to handle department synchronization
router.post('/departments', syncDepartment);

module.exports = router;