"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioToBigInt = exports.ioTsJsDate = void 0;
/**
 * Custom io-ts types. See how to create new io-ts types here:
 * https://github.com/gcanti/io-ts/blob/master/index.md#the-idea.
 */
const t = require("io-ts");
exports.ioTsJsDate = new t.Type('JSDate', (input) => input instanceof Date, (input, context) => input instanceof Date ? t.success(input) : t.failure(input, context), t.identity);
exports.ioToBigInt = new t.Type('BigInt', (input) => typeof input === 'bigint', (input, context) => typeof input === 'bigint' ? t.success(input) : t.failure(input, context), t.identity);
