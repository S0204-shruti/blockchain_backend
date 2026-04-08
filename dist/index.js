"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const identity_1 = __importDefault(require("./routes/identity"));
const credentials_1 = __importDefault(require("./routes/credentials"));
const store_1 = require("./agent/store");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});
// Routes
app.use('/api/identities', identity_1.default);
app.use('/api/credentials', credentials_1.default);
// 404
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});
// Seed demo data
(0, store_1.seedDemoData)();
app.listen(PORT, () => {
    console.log(`\n🚀 Blockchain Identity Backend running on http://localhost:${PORT}`);
    console.log(`📋 Health: http://localhost:${PORT}/health`);
    console.log(`🔑 Identities: http://localhost:${PORT}/api/identities`);
    console.log(`📜 Credentials: http://localhost:${PORT}/api/credentials\n`);
});
exports.default = app;
