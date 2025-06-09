const express = require('express');
const router = express.Router();
const { getDocuments, submitChangeRequest, syncUser, uploadDocument, viewDocument, syncTenant, syncDepartment, syncRole, getDepartment, getDepartments } = require('../controllers/documentController');
const authenticateToken = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// -------------------
// Postman Test Guide:
// -------------------

// 1. GET /documents
//    - Method: GET
//    - URL: http://localhost:PORT/documents
//    - Headers: Authorization: Bearer <token>
//    - Query params (optional): category, title, page, limit, sortBy, order

// 2. POST /documents
//    - Method: POST
//    - URL: http://localhost:PORT/documents
//    - Headers: Authorization: Bearer <token>
//    - Body: form-data
//      - file: <PDF file>
//      - title: string
//      - category: string
//      - version: string
//      - revision: string
//      - description: string

// 3. GET /documents/:id/view
//    - Method: GET
//    - URL: http://localhost:PORT/documents/<documentId>/view
//    - Headers: Authorization: Bearer <token>

// 4. POST /change-requests
//    - Method: POST
//    - URL: http://localhost:PORT/change-requests
//    - Headers: Authorization: Bearer <token>
//    - Body: JSON
//      {
//        "documentId": "<uuid>",
//        "section": "Section name/number",
//        "proposedChange": "Describe the change",
//        "justification": "Why this change?"
//      }

// 5. GET /departments/:id
//    - Method: GET
//    - URL: http://localhost:PORT/departments/<departmentId>
//    - Headers: Authorization: Bearer <token>

// 6. GET /departments
//    - Method: GET
//    - URL: http://localhost:PORT/departments
//    - Headers: Authorization: Bearer <token>

// 7. POST /tenants
//    - Method: POST
//    - URL: http://localhost:PORT/tenants
//    - Body: JSON
//      {
//        "id": "<uuid>",
//        "name": "Tenant Name",
//        "domain": "example.com",
//        "email": "contact@example.com",
//        "type": "Type"
//      }

// 8. POST /departments
//    - Method: POST
//    - URL: http://localhost:PORT/departments
//    - Body: JSON
//      {
//        "id": "<uuid>",
//        "name": "Department Name",
//        "code": "DPT01",
//        "tenantId": "<uuid>",
//        "createdBy": "<uuid>",
//        "headId": "<uuid>"
//      }

// 9. POST /roles
//    - Method: POST
//    - URL: http://localhost:PORT/roles
//    - Body: JSON
//      {
//        "id": "<uuid>",
//        "name": "Role Name",
//        "tenantId": "<uuid>"
//      }

// 10. POST /users
//     - Method: POST
//     - URL: http://localhost:PORT/users
//     - Body: JSON
//       {
//         "id": "<uuid>",
//         "email": "user@example.com",
//         "firstName": "First",
//         "lastName": "Last",
//         "tenantId": "<uuid>",
//         "createdBy": "<uuid>",
//         "roleIds": ["<uuid>", ...],
//         "departmentId": "<uuid>"
//       }

// Define routes
router.get('/documents', authenticateToken, getDocuments);
router.post('/documents', authenticateToken, upload.single('file'), uploadDocument);
router.get('/documents/:id/view', authenticateToken, viewDocument);
router.get('/departments/:id', authenticateToken, getDepartment);
router.get('/departments', authenticateToken, getDepartments);

router.post('/change-requests', authenticateToken, submitChangeRequest);

// Routes for synchronization
router.post('/tenants', syncTenant);
router.post('/departments', syncDepartment);
router.post('/roles', syncRole);
router.post('/users', syncUser);

module.exports = router;