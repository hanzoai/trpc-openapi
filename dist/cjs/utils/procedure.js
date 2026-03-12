"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forEachOpenApiProcedure = exports.getInputOutputParsers = exports.getMethod = void 0;
const zod_1 = require("zod");
const mergeInputs = (inputParsers) => {
    return inputParsers.reduce((acc, inputParser) => {
        return acc.merge(inputParser);
    }, zod_1.z.object({}));
};
const getMethod = (procedure) => {
    return getProcedureType(procedure) === 'query' ? 'GET' : 'POST';
};
exports.getMethod = getMethod;
// `inputParser` & `outputParser` are private so this is a hack to access it
const getInputOutputParsers = (procedure) => {
    const inputs = procedure._def.inputs;
    // @ts-expect-error The types seems to be incorrect
    const output = procedure._def.output;
    let inputParser;
    if (inputs.length >= 2) {
        inputParser = mergeInputs(inputs);
    }
    else if (inputs.length === 1) {
        inputParser = inputs[0];
    }
    else {
        inputParser = zod_1.z.object({});
    }
    return {
        inputParser,
        outputParser: output,
        hasInputsDefined: inputs.length > 0,
    };
};
exports.getInputOutputParsers = getInputOutputParsers;
const getProcedureType = (procedure) => {
    if (!procedure._def.type) {
        throw new Error('Unknown procedure type');
    }
    return procedure._def.type;
};
const forEachOpenApiProcedure = (procedureRecord, callback) => {
    var _a, _b, _c, _d, _e, _f;
    for (const [path, procedure] of Object.entries(procedureRecord)) {
        const type = getProcedureType(procedure);
        const meta = procedure._def.meta;
        if (((_a = meta === null || meta === void 0 ? void 0 : meta.openapi) === null || _a === void 0 ? void 0 : _a.enabled) === false) {
            continue;
        }
        const additional = (_c = (_b = meta === null || meta === void 0 ? void 0 : meta.openapi) === null || _b === void 0 ? void 0 : _b.additional) !== null && _c !== void 0 ? _c : false;
        const override = (_e = (_d = meta === null || meta === void 0 ? void 0 : meta.openapi) === null || _d === void 0 ? void 0 : _d.override) !== null && _e !== void 0 ? _e : false;
        const defaultOpenApiMeta = {
            method: (0, exports.getMethod)(procedure),
            path: `/${path}`,
            enabled: true,
            tags: [(_f = path.split('.')[0]) !== null && _f !== void 0 ? _f : 'default'],
            protect: true,
        };
        let openapi;
        if (override && (meta === null || meta === void 0 ? void 0 : meta.openapi)) {
            openapi = Object.assign({}, meta.openapi);
        }
        else if (additional && (meta === null || meta === void 0 ? void 0 : meta.openapi)) {
            openapi = Object.assign(Object.assign({}, defaultOpenApiMeta), meta.openapi);
        }
        else if (meta === null || meta === void 0 ? void 0 : meta.openapi) {
            openapi = Object.assign(Object.assign({}, meta.openapi), defaultOpenApiMeta);
        }
        else {
            openapi = defaultOpenApiMeta;
        }
        if (openapi.enabled !== false) {
            callback({
                path,
                type,
                procedure: procedure,
                meta: Object.assign({ openapi }, meta),
            });
        }
    }
};
exports.forEachOpenApiProcedure = forEachOpenApiProcedure;
//# sourceMappingURL=procedure.js.map