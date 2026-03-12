import { z } from 'zod';
const mergeInputs = (inputParsers) => {
    return inputParsers.reduce((acc, inputParser) => {
        return acc.merge(inputParser);
    }, z.object({}));
};
export const getMethod = (procedure) => {
    return getProcedureType(procedure) === 'query' ? 'GET' : 'POST';
};
// `inputParser` & `outputParser` are private so this is a hack to access it
export const getInputOutputParsers = (procedure) => {
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
        inputParser = z.object({});
    }
    return {
        inputParser,
        outputParser: output,
        hasInputsDefined: inputs.length > 0,
    };
};
const getProcedureType = (procedure) => {
    if (!procedure._def.type) {
        throw new Error('Unknown procedure type');
    }
    return procedure._def.type;
};
export const forEachOpenApiProcedure = (procedureRecord, callback) => {
    for (const [path, procedure] of Object.entries(procedureRecord)) {
        const type = getProcedureType(procedure);
        const meta = procedure._def.meta;
        if (meta?.openapi?.enabled === false) {
            continue;
        }
        const additional = meta?.openapi?.additional ?? false;
        const override = meta?.openapi?.override ?? false;
        const defaultOpenApiMeta = {
            method: getMethod(procedure),
            path: `/${path}`,
            enabled: true,
            tags: [path.split('.')[0] ?? 'default'],
            protect: true,
        };
        let openapi;
        if (override && meta?.openapi) {
            openapi = { ...meta.openapi };
        }
        else if (additional && meta?.openapi) {
            openapi = { ...defaultOpenApiMeta, ...meta.openapi };
        }
        else if (meta?.openapi) {
            openapi = { ...meta.openapi, ...defaultOpenApiMeta };
        }
        else {
            openapi = defaultOpenApiMeta;
        }
        if (openapi.enabled !== false) {
            callback({
                path,
                type,
                procedure: procedure,
                meta: {
                    openapi,
                    ...meta,
                },
            });
        }
    }
};
//# sourceMappingURL=procedure.js.map