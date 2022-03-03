"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
const utils_1 = require("../../../shared/utils");
// TODO:Flytta till en i en constants fil, och gruppera med and
const delayExpectedQueryFormatMsg = "Incorrect delay query format. Expected format: [{i?:number, sq?:number, ms:number},...n] where i and sq are mutually exclusive.";
function getManifestConfigError(value) {
    const o = value;
    if (o.ms && typeof o.ms !== "number") {
        return delayExpectedQueryFormatMsg;
    }
    if (o.i === undefined && o.sq === undefined) {
        return "Incorrect delay query format. Either 'i' or 'sq' is required in a single query object.";
    }
    if (!(o.i === "*" || typeof o.i === "number") && !(o.sq === "*" || typeof o.sq === "number")) {
        return delayExpectedQueryFormatMsg;
    }
    if (o.i !== undefined && o.sq !== undefined) {
        return "Incorrect delay query format. 'i' and 'sq' are mutually exclusive in a single query object.";
    }
    if (o.sq < 0) {
        return "Incorrect delay query format. Field sq must be 0 or positive.";
    }
    if (o.i < 0) {
        return "Incorrect delay query format. Field i must be 0 or positive.";
    }
    return "";
}
function isValidSegmentConfig(value) {
    const o = value;
    if (o.ms && typeof o.ms !== "number") {
        return false;
    }
    return true;
}
const delayConfig = {
    getManifestConfigs(delayConfigString) {
        let configs = JSON.parse(delayConfigString);
        // Verify it's at least an array
        if (!Array.isArray(configs)) {
            return [
                {
                    message: delayExpectedQueryFormatMsg,
                    status: 400,
                },
                null,
            ];
        }
        // Verify integrity of array content
        for (let i = 0; i < configs.length; i++) {
            const error = getManifestConfigError(configs[i]);
            if (error) {
                return [{ message: error, status: 400 }, null];
            }
        }
        const configIndexMap = new Map();
        const configSqMap = new Map();
        for (let i = 0; i < configs.length; i++) {
            const config = configs[i];
            const corruptorConfig = {
                fields: null,
            };
            if (config.ms) {
                corruptorConfig.fields = {
                    ms: config.ms,
                };
            }
            // Index default
            if (config.i === "*") {
                // If default is already set, we skip
                if (!configIndexMap.has(config.i) && !configSqMap.has(config.i)) {
                    corruptorConfig.i = config.i;
                    configIndexMap.set(config.i, corruptorConfig);
                }
            }
            // Index numeric
            if (typeof config.i === "number" && !configIndexMap.has(config.i)) {
                corruptorConfig.i = config.i;
                configIndexMap.set(config.i, corruptorConfig);
            }
            // Sequence default
            if (config.sq === "*") {
                // If default is already set, we skip
                if (!configIndexMap.has(config.sq) && !configSqMap.has(config.sq)) {
                    corruptorConfig.sq = config.sq;
                    configSqMap.set(config.sq, corruptorConfig);
                }
            }
            // Sequence numeric
            if (typeof config.sq === "number" && !configSqMap.has(config.sq)) {
                corruptorConfig.sq = config.sq;
                configSqMap.set(config.sq, corruptorConfig);
            }
        }
        const corruptorConfigs = [];
        for (var value of configIndexMap.values()) {
            corruptorConfigs.push(value);
        }
        for (const value of configSqMap.values()) {
            corruptorConfigs.push(value);
        }
        return [null, corruptorConfigs];
    },
    getSegmentConfigs(delayConfigString) {
        const config = JSON.parse(delayConfigString);
        if (!isValidSegmentConfig(config)) {
            return [utils_1.unparseableError("delay", delayConfigString, "{i?:number, sq?:number, ms:number}"), null];
        }
        return [
            null,
            {
                i: config.i,
                sq: config.sq,
                fields: {
                    ms: config.ms,
                },
            },
        ];
    },
    name: "delay",
};
exports.default = delayConfig;
//# sourceMappingURL=delay.js.map