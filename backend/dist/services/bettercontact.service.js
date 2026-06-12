"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterContactsService = exports.BetterContactService = void 0;
const bettercontacts_service_1 = require("./bettercontacts.service");
Object.defineProperty(exports, "BetterContactsService", { enumerable: true, get: function () { return bettercontacts_service_1.BetterContactsService; } });
class BetterContactService extends bettercontacts_service_1.BetterContactsService {
    constructor(apiKey) {
        super(apiKey);
    }
}
exports.BetterContactService = BetterContactService;
