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
var _this = this;
var BASE_URL = 'http://localhost:3000/api/powra';
function isPOWRA(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    var powra = obj;
    return (typeof powra.id === 'string' &&
        typeof powra.status === 'string' &&
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
        typeof powra.lessonsLearned === 'boolean');
}
var testPOWRAAPI = function () { return __awaiter(_this, void 0, void 0, function () {
    var fetch_1, getAllResponse, _a, _b, _c, newPOWRA, createResponse, createdPOWRAData, createdPOWRA, getOneResponse, _d, _e, _f, updatedPOWRA, updateResponse, _g, _h, _j, deleteResponse, _k, _l, _m, error_1;
    return __generator(this, function (_o) {
        switch (_o.label) {
            case 0:
                _o.trys.push([0, 12, , 13]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('node-fetch'); })];
            case 1:
                fetch_1 = (_o.sent()).default;
                // Test GET all POWRAs
                console.log('Testing GET all POWRAs');
                return [4 /*yield*/, fetch_1(BASE_URL, {
                        method: 'GET',
                        headers: { 'X-Test-Auth': JSON.stringify({ user: { id: 'test-user-id' } }) },
                    })];
            case 2:
                getAllResponse = _o.sent();
                console.log('GET all status:', getAllResponse.status);
                _b = (_a = console).log;
                _c = ['GET all response:'];
                return [4 /*yield*/, getAllResponse.json()];
            case 3:
                _b.apply(_a, _c.concat([_o.sent()]));
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
                    controlMeasures: [
                        { hazardNo: '1', measures: 'Test Measure', risk: 'L' },
                    ],
                    reviewNames: ['Reviewer 1'],
                    reviewDates: [new Date().toISOString()],
                    lessonsLearned: false,
                };
                return [4 /*yield*/, fetch_1(BASE_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Test-Auth': JSON.stringify({ user: { id: 'test-user-id' } }),
                        },
                        body: JSON.stringify(newPOWRA),
                    })];
            case 4:
                createResponse = _o.sent();
                console.log('POST status:', createResponse.status);
                return [4 /*yield*/, createResponse.json()];
            case 5:
                createdPOWRAData = _o.sent();
                if (!isPOWRA(createdPOWRAData)) {
                    throw new Error('Invalid POWRA data received from server');
                }
                createdPOWRA = createdPOWRAData;
                console.log('Created POWRA:', createdPOWRA);
                // Test GET single POWRA
                console.log('\nTesting GET single POWRA');
                return [4 /*yield*/, fetch_1("".concat(BASE_URL, "?id=").concat(createdPOWRA.id), {
                        method: 'GET',
                        headers: { 'X-Test-Auth': JSON.stringify({ user: { id: 'test-user-id' } }) },
                    })];
            case 6:
                getOneResponse = _o.sent();
                console.log('GET one status:', getOneResponse.status);
                _e = (_d = console).log;
                _f = ['GET one response:'];
                return [4 /*yield*/, getOneResponse.json()];
            case 7:
                _e.apply(_d, _f.concat([_o.sent()]));
                // Test PUT (Update) POWRA
                console.log('\nTesting PUT POWRA');
                updatedPOWRA = __assign(__assign({}, createdPOWRA), { site: 'Updated Test Site' });
                return [4 /*yield*/, fetch_1("".concat(BASE_URL, "?id=").concat(createdPOWRA.id), {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Test-Auth': JSON.stringify({ user: { id: 'test-user-id' } }),
                        },
                        body: JSON.stringify(updatedPOWRA),
                    })];
            case 8:
                updateResponse = _o.sent();
                console.log('PUT status:', updateResponse.status);
                _h = (_g = console).log;
                _j = ['Updated POWRA:'];
                return [4 /*yield*/, updateResponse.json()];
            case 9:
                _h.apply(_g, _j.concat([_o.sent()]));
                // Test DELETE POWRA
                console.log('\nTesting DELETE POWRA');
                return [4 /*yield*/, fetch_1("".concat(BASE_URL, "?id=").concat(createdPOWRA.id), {
                        method: 'DELETE',
                        headers: { 'X-Test-Auth': JSON.stringify({ user: { id: 'test-user-id' } }) },
                    })];
            case 10:
                deleteResponse = _o.sent();
                console.log('DELETE status:', deleteResponse.status);
                _l = (_k = console).log;
                _m = ['DELETE response:'];
                return [4 /*yield*/, deleteResponse.json()];
            case 11:
                _l.apply(_k, _m.concat([_o.sent()]));
                return [3 /*break*/, 13];
            case 12:
                error_1 = _o.sent();
                console.error('Error during API testing:', error_1);
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); };
testPOWRAAPI();
