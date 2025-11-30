"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.authorize)('admin'));
router.route('/users')
    .get(admin_controller_1.getAllUsers);
router.route('/users/:id/ban')
    .put(admin_controller_1.banUser);
router.route('/groups')
    .get(admin_controller_1.getAllGroups);
router.route('/groups/:id')
    .delete(admin_controller_1.deleteGroup);
router.route('/pool-requests')
    .get(admin_controller_1.getAllPoolRequests);
router.route('/announcement')
    .post(admin_controller_1.sendAnnouncement);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map