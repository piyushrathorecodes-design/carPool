"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const group_controller_1 = require("../controllers/group.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.route('/create')
    .post(group_controller_1.createGroup);
router.route('/mygroups')
    .get(group_controller_1.getUserGroups);
router.route('/:groupId')
    .get(group_controller_1.getGroup);
router.route('/join/:groupId')
    .post(group_controller_1.joinGroup);
router.route('/leave/:groupId')
    .post(group_controller_1.leaveGroup);
router.route('/lock/:groupId')
    .patch(group_controller_1.lockGroup);
exports.default = router;
//# sourceMappingURL=group.routes.js.map