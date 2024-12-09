"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = require("node-fetch");
console.log("Script started: ".concat(new Date().toISOString()));
var BASE_URL = 'http://localhost:3000/api/powra';
function isPOWRA(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    var powra = obj;
    return (typeof powra.id === 'string' &&
        ['DRAFT', 'SUBMITTED', 'APPROVED'].includes(powra.status) &&
        typeof powra.site === 'string' &&
        typeof powra.date === 'string' &&
        typeof powra.time === 'string' &&
        typeof powra.pilotName === 'string' &&
        typeof powra.location === 'string' &&
        typeof powra.chiefPilot === 'string' &&
        typeof powra.hse === 'string' &&
        Array.isArray(powra.beforeStartChecklist) &&
        Array.isArray(powra.controlMeasures) &&
        Array.isArray(powra.reviewNames) &&
        Array.isArray(powra.reviewDates) &&
        typeof powra.lessonsLearned === 'boolean' &&
        typeof powra.userId === 'string' &&
        typeof powra.createdAt === 'string' &&
        typeof powra.updatedAt === 'string');
}
function fetchWithTimeout(url_1, options_1) {
    return __awaiter(this, arguments, void 0, function (url, options, timeout) {
        var controller, id, response;
        if (timeout === void 0) { timeout = 5000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    controller = new AbortController();
                    id = setTimeout(function () { return controller.abort(); }, timeout);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url, __assign(__assign({}, options), { signal: controller.signal }))];
                case 1:
                    response = _a.sent();
                    clearTimeout(id);
                    return [2 /*return*/, response];
            }
        });
    });
}
function retryFetch(url_1, options_1) {
    return __awaiter(this, arguments, void 0, function (url, options, retries) {
        var err_1;
        if (retries === void 0) { retries = 3; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchWithTimeout(url, options)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    err_1 = _a.sent();
                    if (retries > 0) {
                        console.log("Retrying... (".concat(retries, " attempts left)"));
                        return [2 /*return*/, retryFetch(url, options, retries - 1)];
                    }
                    throw err_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function createMockTestUser() {
    return 'mock-test-user-id';
}
function logResponse(response, operation) {
    return __awaiter(this, void 0, void 0, function () {
        var responseText, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("".concat(operation, " status:"), response.status);
                    console.log("".concat(operation, " headers:"), response.headers.raw());
                    return [4 /*yield*/, response.text()];
                case 1:
                    responseText = _a.sent();
                    console.log("".concat(operation, " response body:"), responseText);
                    try {
                        responseData = JSON.parse(responseText);
                        console.log("".concat(operation, " parsed response:"), responseData);
                        return [2 /*return*/, responseData];
                    }
                    catch (error) {
                        console.error("Error parsing ".concat(operation, " response:"), error);
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var testPOWRAAPI = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1, testUserId, getAllResponse, newPOWRA, createResponse, createdPOWRAData, createdPOWRA, getOneResponse, updatedPOWRA, updateResponse, deleteResponse, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 15, , 16]);
                console.log('Starting POWRA API test...');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, node_fetch_1.default)('https://www.google.com')];
            case 2:
                _a.sent();
                console.log('Network connectivity: OK');
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Network connectivity issue:', error_1);
                return [2 /*return*/];
            case 4:
                testUserId = createMockTestUser();
                console.log('Mock test user created with ID:', testUserId);
                // Test GET all POWRAs
                console.log('\nTesting GET all POWRAs');
                return [4 /*yield*/, retryFetch(BASE_URL, {
                        method: 'GET',
                        headers: { 'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }) },
                    })];
            case 5:
                getAllResponse = _a.sent();
                return [4 /*yield*/, logResponse(getAllResponse, 'GET all')];
            case 6:
                _a.sent();
                // Test POST (Create) POWRA
                console.log('\nTesting POST POWRA');
                newPOWRA = {
                    status: 'DRAFT',
                    site: 'Test Site',
                    date: new Date().toISOString(),
                    time: '12:00',
                    pilotName: 'Test Pilot',
                    location: 'Test Location',
                    chiefPilot: 'Test Chief Pilot',
                    hse: 'Test HSE',
                    beforeStartChecklist: ['Item 1', 'Item 2'],
                    controlMeasures: {
                        create: [
                            { hazardNo: '1', measures: 'Test Measure', risk: 'L' },
                        ],
                    },
                    reviewNames: ['Reviewer 1'],
                    reviewDates: [new Date().toISOString()],
                    lessonsLearned: false,
                };
                console.log('Sending POST request with data:', JSON.stringify(newPOWRA));
                return [4 /*yield*/, retryFetch(BASE_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }),
                        },
                        body: JSON.stringify(newPOWRA),
                    })];
            case 7:
                createResponse = _a.sent();
                return [4 /*yield*/, logResponse(createResponse, 'POST')];
            case 8:
                createdPOWRAData = _a.sent();
                if (!isPOWRA(createdPOWRAData)) {
                    throw new Error('Invalid POWRA data received from server');
                }
                createdPOWRA = createdPOWRAData;
                console.log('Created POWRA:', createdPOWRA);
                // Test GET single POWRA
                console.log('\nTesting GET single POWRA');
                return [4 /*yield*/, retryFetch("".concat(BASE_URL, "?id=").concat(createdPOWRA.id), {
                        method: 'GET',
                        headers: { 'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }) },
                    })];
            case 9:
                getOneResponse = _a.sent();
                return [4 /*yield*/, logResponse(getOneResponse, 'GET one')];
            case 10:
                _a.sent();
                // Test PUT (Update) POWRA
                console.log('\nTesting PUT POWRA');
                updatedPOWRA = __assign(__assign({}, createdPOWRA), { site: 'Updated Test Site', controlMeasures: {
                        upsert: createdPOWRA.controlMeasures.map(function (cm) { return ({
                            where: { id: cm.id },
                            update: cm,
                            create: cm,
                        }); }),
                    } });
                console.log('Sending PUT request with data:', JSON.stringify(updatedPOWRA));
                return [4 /*yield*/, retryFetch("".concat(BASE_URL, "?id=").concat(createdPOWRA.id), {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }),
                        },
                        body: JSON.stringify(updatedPOWRA),
                    })];
            case 11:
                updateResponse = _a.sent();
                return [4 /*yield*/, logResponse(updateResponse, 'PUT')];
            case 12:
                _a.sent();
                // Test DELETE POWRA
                console.log('\nTesting DELETE POWRA');
                return [4 /*yield*/, retryFetch("".concat(BASE_URL, "?id=").concat(createdPOWRA.id), {
                        method: 'DELETE',
                        headers: { 'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }) },
                    })];
            case 13:
                deleteResponse = _a.sent();
                return [4 /*yield*/, logResponse(deleteResponse, 'DELETE')];
            case 14:
                _a.sent();
                console.log('POWRA API test completed successfully.');
                return [3 /*break*/, 16];
            case 15:
                error_2 = _a.sent();
                console.error('Error during API testing:', error_2);
                if (error_2 instanceof Error) {
                    console.error('Error name:', error_2.name);
                    console.error('Error message:', error_2.message);
                    console.error('Error stack:', error_2.stack);
                }
                return [3 /*break*/, 16];
            case 16: return [2 /*return*/];
        }
    });
}); };
console.log('Starting test script...');
testPOWRAAPI().then(function () { return console.log('Test script finished.'); });
