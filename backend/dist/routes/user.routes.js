"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.route('/')
    .get((0, auth_middleware_1.authorize)('admin'), user_controller_1.getUsers)
    .post((0, auth_middleware_1.authorize)('admin'), user_controller_1.createUser);
router.route('/location')
    .put(user_controller_1.updateUserLocation);
router.route('/:id')
    .get((0, auth_middleware_1.authorize)('admin'), user_controller_1.getUser)
    .put(user_controller_1.updateUser)
    .delete((0, auth_middleware_1.authorize)('admin'), user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map