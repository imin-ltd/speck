"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = exports.validate = exports.SpeckValidationErrors = exports.gen = exports.pickRequireds = exports.union = exports.unionObjects = exports.intersection = exports.partial = exports.type = exports.record = exports.nonEmptyArray = exports.array = exports.unknownRecord = exports.literalNumberEnum = exports.literalStringEnum = exports.nil = exports.bigInt = exports.jsDate = exports.boolean = exports.positiveInt = exports.nonNegativeInt = exports.int = exports.positiveFloat = exports.nonNegativeFloat = exports.float = exports.isoDateTimeString = exports.emailString = exports.urlString = exports.string = exports.literal = void 0;
const t = require("io-ts");
const io_ts_reporters_1 = require("io-ts-reporters");
const fc = require("fast-check");
const Either_1 = require("fp-ts/lib/Either");
const _ = require("lodash");
const moment = require("moment");
const ioTsBrands_1 = require("./ioTsBrands");
const ioTsTypes_1 = require("./ioTsTypes");
function createNonObjectSpeck(ioTsType, fastCheckArbitrary) {
    return {
        _ioTsType: ioTsType,
        _fastCheckArbitrary: fastCheckArbitrary,
        _isObjectType: false,
    };
}
/**
 * ObjectSpecks are very similar to NonObjectSpecks. The difference is that
 * ObjectSpecks can be combined with `s.intersection(..)` (i.e. `&` in TypeScript).
 */
function createObjectSpeck(ioTsType, fastCheckArbitrary, allowsUnknown = false) {
    return {
        _ioTsType: ioTsType,
        _fastCheckArbitrary: fastCheckArbitrary,
        _isObjectType: true,
        _allowsUnknown: allowsUnknown,
    };
}
/** # Simple types */
/**
 * Literal type. An item with this type can only have one exact value.
 *
 * - TypeScript: Literal
 * - Runtime Validation: is it this exact literal?
 * - Generation: the literal value
 */
function literal(value) {
    return createNonObjectSpeck(t.literal(value), fc.constant(value));
}
exports.literal = literal;
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string?
 * - Generation: random string
 */
exports.string = createNonObjectSpeck(t.string, fc.string());
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a URL)
 * - Generation: random URL
 */
exports.urlString = createNonObjectSpeck(t.string, fc.webUrl());
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a email)
 * - Generation: random email
 */
exports.emailString = createNonObjectSpeck(t.string, fc.emailAddress());
/**
 * ISO-8601 Date time string e.g. 2001-01-01T01:23:45Z. Has seconds precision
 * and a timezone designator
 *
 * - TypeScript: string
 * - Runtime validation: is it an ISO-8601 datetime?
 * - Generation: Random ISO-8601 datetime string
 */
exports.isoDateTimeString = createNonObjectSpeck(ioTsBrands_1.IsoDateTimeString, fc.date({
    min: new Date('2020-01-01T00:00:00Z'),
    max: new Date('2030-01-01T00:00:00Z'),
}).map(d => moment(d).utc().format()));
/**
 * Floating point number
 *
 * - TypeScript: number
 * - Runtime validation: is it a number?
 * - Generation: Random floating point number
 *
 * TODO: Make min/max digit (for generation) a parameter rather than fixed at
 * -100 - 100
 */
exports.float = createNonObjectSpeck(t.number, fc.float(-100, 100));
/**
 * A floating point number that is 0 or greater. You could use this for a
 * price, for example
 *
 * - TypeScript: number
 * - Runtime Validation: is it a number? (TODO: also test that it is positive)
 * - Generation: Random positive floating point number
 *
 * TODO: Make max digit (for generation) a parameter rather than fixed at 100
 */
exports.nonNegativeFloat = createNonObjectSpeck(t.number, fc.float(0, 100));
/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeFloat */
exports.positiveFloat = exports.nonNegativeFloat;
/**
 * Integer
 *
 * - TypeScript: number
 * - Runtime validation: is it an integer?
 * - Generation: Random integer
 *
 * TODO: Make min/max digit (for generation) a parameter rather than fixed at
 * -100 - 100
 */
exports.int = createNonObjectSpeck(t.Int, fc.integer(-100, 100));
/**
 * Integer whose value is 0 or greater. You could use this for an array index,
 * for example.
 *
 * - TypeScript: number
 * - Runtime validation: is it an integer? (TODO: also test that it is positive)
 * - Generation: Random positive integer
 *
 * TODO: Make max digit (for generation) a parameter rather than fixed at 100
 */
exports.nonNegativeInt = createNonObjectSpeck(t.Int, fc.integer(0, 100));
/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeInt */
exports.positiveInt = exports.nonNegativeInt;
/**
 * Boolean
 *
 * - TypeScript: boolean
 * - Runtime validation: is it an boolean?
 * - Generation: Random boolean
 */
exports.boolean = createNonObjectSpeck(t.boolean, fc.boolean());
/**
 * JS Date (e.g. `new Date()`)
 *
 * - TypeScript: Date
 * - Runtime validation: instanceof Date
 * - Generation: Random Date
 */
exports.jsDate = createNonObjectSpeck(ioTsTypes_1.ioTsJsDate, fc.date());
/**
 * BigInt (e.g. `123n`)
 *
 * - TypeScript: bigint
 * - Runtime validation: typeof x === 'bigint'
 * - Generation: Random BigInt
 */
exports.bigInt = createNonObjectSpeck(ioTsTypes_1.ioToBigInt, fc.bigInt());
/**
 * `null` or `undefined`
 */
exports.nil = createNonObjectSpeck(t.union([t.null, t.undefined]), fc.boolean().map(trueOrFalse => trueOrFalse ? null : undefined));
/**
 * Enum of string literals
 */
function literalStringEnum(literalsArray) {
    const literalA = t.literal(literalsArray[0]);
    const literalB = t.literal(literalsArray[1]);
    const literalsRest = literalsArray.slice(2).map(l => t.literal(l));
    const ioTsType = t.union([literalA, literalB, ...literalsRest]);
    const fastCheckArbitrary = fc.oneof(...(literalsArray.map(l => fc.constant(l))));
    return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}
exports.literalStringEnum = literalStringEnum;
/**
 * Enum of number literals
 */
function literalNumberEnum(literalsArray) {
    const literalA = t.literal(literalsArray[0]);
    const literalB = t.literal(literalsArray[1]);
    const literalsRest = literalsArray.slice(2).map(l => t.literal(l));
    const ioTsType = t.union([literalA, literalB, ...literalsRest]);
    const fastCheckArbitrary = fc.oneof(...(literalsArray.map(l => fc.constant(l))));
    return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}
exports.literalNumberEnum = literalNumberEnum;
exports.unknownRecord = createObjectSpeck(t.UnknownRecord, 
// `fc.object()` returns an `Arbitrary<object>` type. TypeScript's handling
// of the `object` type is rather odd. In some circumstances, it's identical
// `any` and in some circumstances an empty object (`{}`).
// e.g. `/** @type {object} */(someObject).someFieldName` will return an
// error along the lines of "someFieldName does not exist on type `object`".
// This is why I cast `fc.object()` to be an arbitrary for an object of
// unknowns. This handles better and also aligns with io-ts's UnknownRecord.
fc.object(), true);
/** # Higher order types */
/**
 * Array of specks
 */
function array(speck) {
    return createNonObjectSpeck(t.array(speck._ioTsType), fc.array(speck._fastCheckArbitrary));
}
exports.array = array;
/**
 * Array of specks where there must be at least one element in the array.
 *
 * Unfortunately fastcheck requires a maxLength when defining a minLength. It has been set to 5 initially,
 * if this is not enough, this can be increased.
 */
function nonEmptyArray(speck) {
    return createNonObjectSpeck(ioTsBrands_1.nonEmptyArray(speck._ioTsType), fc.array(speck._fastCheckArbitrary, 1, 5));
}
exports.nonEmptyArray = nonEmptyArray;
/**
 * The speck equivalent of the TypeScript `Record<..>` type.
 *
 * e.g. `s.record(s.string, s.float)` would have TS type `Record<string, number>`.
 */
function record(keySpeck, valueSpeck) {
    // TODO fix the type here
    return createObjectSpeck(t.record(keySpeck._ioTsType, valueSpeck._ioTsType), fc.dictionary(keySpeck._fastCheckArbitrary, valueSpeck._fastCheckArbitrary));
}
exports.record = record;
/**
 * Used to get a record of io-ts types and a record of fast-check Arbitraries
 * from a record of Specks
 */
function getIoTsTypesAndFastCheckArbitraries(recordOfSpecks, { areFieldsNilable } = {}) {
    // Unfortunately these types have to be Partial because there's no way (as
    // far as I can tell?) to inform TypeScript that they will be filled with
    // every key once the for loop iteration has completed.
    // `reduce()` feels like the right solution, but, again, TypeScript will not
    // differentiate between the intermediate state and the final state.
    const ioTsTypes = {};
    const fastCheckArbitraries = {};
    for (const key in recordOfSpecks) {
        const initialIoTsType = recordOfSpecks[key]._ioTsType;
        ioTsTypes[key] = areFieldsNilable
            ? t.union([initialIoTsType, t.null, t.undefined])
            : initialIoTsType;
        fastCheckArbitraries[key] = recordOfSpecks[key]._fastCheckArbitrary;
    }
    return {
        ioTsTypes: ioTsTypes,
        fastCheckArbitraries: fastCheckArbitraries,
    };
}
/**
 * A record of Specks e.g.
 *
 * ```js
 * const Url = s.type({
 *   type: s.literal('Url'),
 *   id: s.urlString,
 * });
 * ```
 *
 * Each field is required.
 */
function type(recordOfSpecks) {
    const { ioTsTypes, fastCheckArbitraries } = getIoTsTypesAndFastCheckArbitraries(recordOfSpecks);
    return createObjectSpeck(t.type(ioTsTypes), fc.record(fastCheckArbitraries));
}
exports.type = type;
/**
 * A record of Specks that are optional e.g.
 *
 * ```js
 * const PartialUrl = s.partial({
 *   type: s.literal('Url'),
 *   id: s.urlString,
 * });
 * ```
 *
 * Objects that match this speck can have these fields included or not. If they are included,
 * they must either match the specified speck, or be null or undefined.
 * In this way, `partial()` considers `null`, `undefined` and the absence of a field to be equivalent.
 */
function partial(recordOfSpecks) {
    const { ioTsTypes, fastCheckArbitraries } = getIoTsTypesAndFastCheckArbitraries(recordOfSpecks, { areFieldsNilable: true });
    return createObjectSpeck(t.partial(ioTsTypes), fc.record(fastCheckArbitraries, { withDeletedKeys: true }));
}
exports.partial = partial;
/**
 * Combine two Specks in a way that is equivalent to TypeScript's `&` operator.
 *
 * e.g. `s.intersection(s.type({ abc: s.string }), s.partial({ def: s.number }))`
 * will create a Speck with a required `abc` field and an optional `def` field.
 *
 * This can only be used on ObjectSpecks, as intersections do not make any sense on atomic
 * types. e.g. what is `3 & null`? There is no intersection between those two types.
 */
function intersection([speckA, speckB]) {
    const ioTsType = t.intersection([speckA._ioTsType, speckB._ioTsType]);
    const fastCheckArbitrary = fc.tuple(speckA._fastCheckArbitrary, speckB._fastCheckArbitrary)
        .map(values => Object.assign({}, ...values));
    // If either of the combined specks allows unknown fields, then their
    // intersection naturally also allows unknown fields
    const allowsUnknown = speckA._allowsUnknown || speckB._allowsUnknown;
    return createObjectSpeck(ioTsType, fastCheckArbitrary, allowsUnknown);
}
exports.intersection = intersection;
/**
 * Equivalent to `s.union(..)` but is defined specifically for ObjectSpecks. This allows the resulting
 * type to maintain its ObjectSpeck status and therefore be usable for intersections.
 *
 * For more info, See: `s.union(..)`.
 */
function unionObjects([speckA, speckB]) {
    const ioTsType = t.union([speckA._ioTsType, speckB._ioTsType]);
    const fastCheckArbitrary = fc.oneof(speckA._fastCheckArbitrary, speckB._fastCheckArbitrary);
    return createObjectSpeck(ioTsType, fastCheckArbitrary);
}
exports.unionObjects = unionObjects;
/**
 * A speck that could be one type or another. Equivalent to `|` in TypeScript
 * (https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types).
 *
 * This type of union cannot be used with intersection(). This is because
 * intersection() cannot meaningfully work on
 * NonObjectSpecks (e.g. what's the intersection between `3` and
 * `{ x: number }`? No value could satisfy that intersection, so it's
 * meaningless).
 *
 * Example:
 *
 * ```js
 * >  var s = require('./lib')
 * > const NumberOrString = s.union([s.string, s.int]);
 * > s.gen(NumberOrString)
 * 1
 * > s.gen(NumberOrString)
 * 'qfxl'
 * > s.validate(NumberOrString, 1);
 * 1
 * > s.validate(NumberOrString, '1');
 * '1'
 * > s.validate(NumberOrString, true);
 * { Error: SpeckValidationErrors
 *     at Object.validate (/Volumes/Imin Virtual Disk/Imin/speck/lib/index.js:481:12)
 *     at repl:1:3
 *     at Script.runInThisContext (vm.js:122:20)
 *     at REPLServer.defaultEval (repl.js:332:29)
 *     at bound (domain.js:402:14)
 *     at REPLServer.runBound [as eval] (domain.js:415:12)
 *     at REPLServer.onLine (repl.js:642:10)
 *     at REPLServer.emit (events.js:203:15)
 *     at REPLServer.EventEmitter.emit (domain.js:448:20)
 *     at REPLServer.Interface._onLine (readline.js:308:10)
 *   errors:
 *    [ { value: true, context: [Array], message: undefined },
 *      { value: true, context: [Array], message: undefined } ] }
 * ```
 */
function union([speckA, speckB]) {
    const ioTsType = t.union([speckA._ioTsType, speckB._ioTsType]);
    const fastCheckArbitrary = fc.oneof(speckA._fastCheckArbitrary, speckB._fastCheckArbitrary);
    return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}
exports.union = union;
/**
 * From a record of specks, pick which ones will be required fields and which
 * will be optional. e.g.
 *
 * ```ts
 * const FIELDS = {
 *   type: s.literal('Spaceship'),
 *   fuel: s.positiveFloat,
 *   crew: s.array(Person),
 *   name: s.string,
 * };
 * const MannedShip = s.pickRequireds(FIELDS, ['type', 'fuel', 'crew']); // `name` is optional
 * const SemiAutonomousShip = s.pickRequireds(FIELDS, ['type', 'fuel']); // `crew` and `name` are optional
 * ```
 */
function pickRequireds(recordOfSpecks, requiredFields) {
    const requireds = type(_.pick(recordOfSpecks, requiredFields));
    const optionals = partial(_.omit(recordOfSpecks, requiredFields));
    return intersection([requireds, optionals]);
}
exports.pickRequireds = pickRequireds;
/** API functions */
/**
 * Generate test data for a speck
 *
 * ```ts
 * s.gen(C1Request, {
 *   organization: s.gen(Organization, {
 *     id: '...',
 *   }),
 * });
 * ```
 */
function gen(speck, overrides = null) {
    const sampleResult = fc.sample(speck._fastCheckArbitrary, 1)[0];
    if (speck._isObjectType && overrides) {
        // ! This mutates `sampleResult`
        // This is fine given that this is the end of the function and so there's
        // no chance of confusion about the value of `sampleResult`
        return Object.assign(sampleResult, overrides);
    }
    return sampleResult;
}
exports.gen = gen;
class SpeckValidationErrors extends Error {
    /**
     * @param ioTsErrorResponse Response from running .decode from an io-ts type
     */
    constructor(ioTsErrorResponse) {
        // TODO would be good to have a Speck name here, but we don't record names for types..
        // Then we could say something like "Validation error for type `MyType`"
        super('Validation Error');
        this.name = 'SpeckValidationErrors';
        this.summary = io_ts_reporters_1.default.report(ioTsErrorResponse);
        // @ts-expect-error Hack to make this only read env var if `process` is recognised (and therefore,
        // probably we're in a Node.js environment).
        // Speck works with browser code as well as Node.js code, which is why this is needed.
        if (typeof process !== 'undefined' && process.env.SPECK_ERROR_EXCLUDE_DETAIL === 'true') {
            // Do not set `errors` as we don't want that level of detail
        }
        else {
            this.errors = ioTsErrorResponse.left;
        }
    }
}
exports.SpeckValidationErrors = SpeckValidationErrors;
function validate(speck, item, { skipStrict = false } = {}) {
    /**
     * Due to Typescript's inherent strict nature, all io-ts object types are, by default, made strict here.
     * This means any excessive fields are stripped during the decode().
     * For a completely optional (partial) object, the decode could return an empty object if there are only excessive
     * fields in the pre-decoded object.
     *
     * However, `t.exact()` should not be used for specks that have unknown
     * fields (e.g. a speck that has an intersection with `s.unknownRecord`).
     * t.exact(), will strip away the unknown fields, which is incorrect e.g.
     *
     * ```
     * > t.exact(t.intersection([t.type({ x: t.number }), t.UnknownRecord])).decode({ x: 3, y: 4 })
     * { x: 3 }
     * ```
     *
     * ^ The `y` was stripped
     */
    const validationResult = (speck._isObjectType && !skipStrict && !speck._allowsUnknown)
        ? t.exact(speck._ioTsType).decode(item)
        : speck._ioTsType.decode(item);
    if (Either_1.isLeft(validationResult)) {
        return new SpeckValidationErrors(validationResult);
    }
    return speck._ioTsType.encode(validationResult.right);
}
exports.validate = validate;
/**
 * It's like `s.validate(..)` but it just always throws the error. For vital assertions or quick experimentation.
 */
function assert(speck, item) {
    const result = validate(speck, item, { skipStrict: true });
    if (result instanceof SpeckValidationErrors) {
        throw result;
    }
    return result;
}
exports.assert = assert;
