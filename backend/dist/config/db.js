"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment variables');
}
exports.pool = new pg_1.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000
});
async function query(text, params) {
    const result = await exports.pool.query(text, params);
    return { rows: result.rows };
}
