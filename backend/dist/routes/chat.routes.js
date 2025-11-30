"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.route('/send')
    .post(chat_controller_1.sendMessage);
router.route('/history/:groupId')
    .get(chat_controller_1.getChatHistory);
router.route('/read/:messageId')
    .put(chat_controller_1.markAsRead);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map