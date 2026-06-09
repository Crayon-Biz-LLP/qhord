"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.rateLimiter = rateLimiter;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
async function hashPassword(password) {
    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    return bcrypt_1.default.hash(password, rounds);
}
async function verifyPassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Missing or invalid Authorization header' });
        return;
    }
    const token = header.substring('Bearer '.length);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
const ipCache = new Map();
function rateLimiter(windowMs, maxRequests) {
    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const now = Date.now();
        let record = ipCache.get(ip);
        if (!record || now > record.resetTime) {
            record = { count: 0, resetTime: now + windowMs };
        }
        record.count++;
        ipCache.set(ip, record);
        if (record.count > maxRequests) {
            res.status(429).json({ message: 'Too many authentication attempts. Please try again later.' });
            return;
        }
        next();
    };
}
