/** # Simple types */
/**
 * Literal type. An item with this type can only have one exact value.
 *
 * - TypeScript: Literal
 * - Runtime Validation: is it this exact literal?
 * - Generation: the literal value
 *
 * @template {string | number | boolean} TLiteralValue
 *
 * @param {TLiteralValue} value
 */
export function literal<TLiteralValue extends string | number | boolean>(value: TLiteralValue): import("./types").NonObjectSpeck<TLiteralValue, TLiteralValue>;
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string?
 * - Generation: random string
 */
export const string: import("./types").NonObjectSpeck<string, string>;
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a URL)
 * - Generation: random URL
 */
export const urlString: import("./types").NonObjectSpeck<string, string>;
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a email)
 * - Generation: random email
 */
export const emailString: import("./types").NonObjectSpeck<string, string>;
/**
 * ISO-8601 Date time string e.g. 2001-01-01T01:23:45Z. Has seconds precision
 * and a timezone designator
 *
 * - TypeScript: string
 * - Runtime validation: is it an ISO-8601 datetime?
 * - Generation: Random ISO-8601 datetime string
 */
export const isoDateTimeString: import("./types").NonObjectSpeck<string, import("io-ts").Branded<string, import("./types").IsoDateTimeStringBrand>>;
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
export const float: import("./types").NonObjectSpeck<number, number>;
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
export const nonNegativeFloat: import("./types").NonObjectSpeck<number, number>;
/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeFloat */
export const positiveFloat: import("./types").NonObjectSpeck<number, number>;
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
export const int: import("./types").NonObjectSpeck<number, import("io-ts").Branded<number, import("io-ts").IntBrand>>;
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
export const nonNegativeInt: import("./types").NonObjectSpeck<number, import("io-ts").Branded<number, import("io-ts").IntBrand>>;
/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeInt */
export const positiveInt: import("./types").NonObjectSpeck<number, import("io-ts").Branded<number, import("io-ts").IntBrand>>;
/**
 * Boolean
 *
 * - TypeScript: boolean
 * - Runtime validation: is it an boolean?
 * - Generation: Random boolean
 *
 */
export const boolean: import("./types").NonObjectSpeck<boolean, boolean>;
/**
 * JS Date (e.g. `new Date()`)
 *
 * - TypeScript: Date
 * - Runtime validation: instanceof Date
 * - Generation: Random Date
 */
export const jsDate: import("./types").NonObjectSpeck<Date, Date>;
export const unknownRecord: import("./types").ObjectSpeck<{
    [k: string]: unknown;
}, {
    [k: string]: unknown;
}>;
/** # Higher order types */
/**
 * Array of specks
 *
 * @template {import('./types').Speck<any>} TSpeck
 * @param {TSpeck} speck
 * @returns {import('./types').ArrayType<TSpeck>}
 */
export function array<TSpeck extends import("./types").Speck<any, any>>(speck: TSpeck): import("./types").NonObjectSpeck<import("io-ts").OutputOf<TSpeck["_ioTsType"]>[], import("io-ts").OutputOf<TSpeck["_ioTsType"]>[]>;
/**
 * Array of specks where there must be at least one element in the array.
 *
 * Unfortunately fastcheck requires a maxLength when defining a minLength. It has been set to 5 initially,
 * if this is not enough, this can be increased.
 *
 * @template {import('./types').Speck<any>} TSpeck
 * @param {TSpeck} speck
 * @returns {import('./types').NonEmptyBrandedArrayType<TSpeck>}
 */
export function nonEmptyArray<TSpeck extends import("./types").Speck<any, any>>(speck: TSpeck): import("./types").NonObjectSpeck<import("io-ts").OutputOf<TSpeck["_ioTsType"]>[], import("io-ts").Branded<import("io-ts").OutputOf<TSpeck["_ioTsType"]>[], import("./types").NonEmptyArrayBrand<import("io-ts").OutputOf<TSpeck["_ioTsType"]>>>>;
/**
 * @deprecated Use literalStringEnum or literalNumberEnum instead
 * Enum of string literals
 * TODO Typescript type of return object is too vague (returns string instead of 'abc' for example).
 *
 * @template {string | number} TLiteralValue
 * @template {[TLiteralValue, TLiteralValue, ...TLiteralValue[]]} TLiterals
 *
 * @param {TLiterals} literalsArray
 */
export function literalEnum<TLiteralValue extends string | number, TLiterals extends [TLiteralValue, TLiteralValue, ...TLiteralValue[]]>(literalsArray: TLiterals): import("./types").NonObjectSpeck<TLiteralValue, TLiteralValue>;
/**
 * Enum of string literals
 *
 * @template {string} TLiteralValue
 *
 * @param {[TLiteralValue, TLiteralValue, ...TLiteralValue[]]} literalsArray
 */
export function literalStringEnum<TLiteralValue extends string>(literalsArray: [TLiteralValue, TLiteralValue, ...TLiteralValue[]]): import("./types").NonObjectSpeck<TLiteralValue, TLiteralValue>;
/**
 * Enum of number literals
 *
 * @template {number} TLiteralValue
 *
 * @param {[TLiteralValue, TLiteralValue, ...TLiteralValue[]]} literalsArray
 */
export function literalNumberEnum<TLiteralValue extends number>(literalsArray: [TLiteralValue, TLiteralValue, ...TLiteralValue[]]): import("./types").NonObjectSpeck<TLiteralValue, TLiteralValue>;
/**
 * The speck equivalent of the TypeScript `Record<..>` type.
 *
 * e.g. `s.record(s.string, s.float)` would have TS type `Record<string, number>`.
 *
 * @template {typeof string} TKeySpeck
 * @template {import('./types').Speck<any>} TValueSpeck
 * @param {TKeySpeck} keySpeck
 * @param {TValueSpeck} valueSpeck
 * @returns {import('./types').RecordType<TKeySpeck, TValueSpeck>}
 */
export function record<TKeySpeck extends import("./types").NonObjectSpeck<string, string>, TValueSpeck extends import("./types").Speck<any, any>>(keySpeck: TKeySpeck, valueSpeck: TValueSpeck): import("./types").ObjectSpeck<Record<import("io-ts").OutputOf<TKeySpeck["_ioTsType"]>, import("io-ts").OutputOf<TValueSpeck["_ioTsType"]>>, Record<import("io-ts").OutputOf<TKeySpeck["_ioTsType"]>, import("io-ts").OutputOf<TValueSpeck["_ioTsType"]>>>;
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
 *
 * @template {import('./types')._BaseRecordOfSpecks} TRecordOfSpecks
 * @param {TRecordOfSpecks} recordOfSpecks
 * @returns {import('./types').TypeType<TRecordOfSpecks>}
 */
export function type<TRecordOfSpecks extends Record<string, import("./types").Speck<any, any>>>(recordOfSpecks: TRecordOfSpecks): import("./types").ObjectSpeck<{ [K in keyof TRecordOfSpecks]: import("io-ts").OutputOf<TRecordOfSpecks[K]["_ioTsType"]>; }, { [K in keyof TRecordOfSpecks]: import("io-ts").OutputOf<TRecordOfSpecks[K]["_ioTsType"]>; }>;
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
 *
 * @template {import('./types')._BaseRecordOfSpecks} TRecordOfSpecks
 * @param {TRecordOfSpecks} recordOfSpecks
 * @returns {import('./types').PartialType<TRecordOfSpecks>}
 */
export function partial<TRecordOfSpecks extends Record<string, import("./types").Speck<any, any>>>(recordOfSpecks: TRecordOfSpecks): import("./types").ObjectSpeck<{ [K in keyof TRecordOfSpecks]?: import("io-ts").OutputOf<TRecordOfSpecks[K]["_ioTsType"]> | null | undefined; }, { [K in keyof TRecordOfSpecks]?: import("io-ts").OutputOf<TRecordOfSpecks[K]["_ioTsType"]> | null | undefined; }>;
/**
 * _TODO document_
 *
 * @template {import('./types').ObjectSpeck<any>} TA
 * @template {import('./types').ObjectSpeck<any>} TB
 * @param {[TA, TB]} specks
 * @returns {import('./types').IntersectionType<[TA, TB]>}
 */
export function intersection<TA extends import("./types").ObjectSpeck<any, any>, TB extends import("./types").ObjectSpeck<any, any>>([speckA, speckB]: [TA, TB]): import("./types").ObjectSpeck<import("io-ts").OutputOf<TA["_ioTsType"]> & import("io-ts").OutputOf<TB["_ioTsType"]>, import("io-ts").OutputOf<TA["_ioTsType"]> & import("io-ts").OutputOf<TB["_ioTsType"]>>;
/**
 * A speck that could be one thing or another. Equivalent to `|` in TypeScript
 * (https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types).
 *
 * This function is defined specifically for objects. This means that it is
 * not possible to use a non-object speck as one of the parameters. This means
 * that its return value will certainly be an object speck.
 *
 * This is important as intersection() can only meaningfully work on
 * ObjectSpecks (e.g. what's the intersection between `3` and
 * `{ x: number }`? No value could satisfy that intersection, so it's
 * meaningless).
 *
 * Therefore, by doing this, we ensure that intersection, which only
 * accepts ObjectSpecks, will never be given specks by this function that have
 * any chance of not representing objects (e.g. this disallows
 * `'hi' | { x: number }` from being given as an input to intersection()).
 *
 *
 * Example:
 *
 * ```js
 * > var s = require('./lib')
 * > const HiOrBye = s.unionObjects([ s.type({ hi: s.literal(true) }), s.type({ bye: s.literal(true) }) ]);
 * > s.gen(HiOrBye)
 * { hi: true }
 * > s.gen(HiOrBye)
 * { bye: true }
 * > s.validate(HiOrBye, { hey: true })
 * { Error: SpeckValidationErrors
 *     at Object.validate (/Volumes/IMIN VHD/Dev/speck/lib/index.js:416:12)
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
 *    [ { value: undefined, context: [Array], message: undefined },
 *      { value: undefined, context: [Array], message: undefined } ] }
 * > s.validate(HiOrBye, { hi: true })
 * { hi: true }
 * > s.validate(HiOrBye, { bye: true })
 * { bye: true }
 * ```
 *
 * @template {import('./types').ObjectSpeck<any>} TA
 * @template {import('./types').ObjectSpeck<any>} TB
 * @param {[TA, TB]} specks
 * @returns {import('./types').UnionObjectsType<[TA, TB]>}
 */
export function unionObjects<TA extends import("./types").ObjectSpeck<any, any>, TB extends import("./types").ObjectSpeck<any, any>>([speckA, speckB]: [TA, TB]): import("./types").ObjectSpeck<import("io-ts").OutputOf<TA["_ioTsType"]> | import("io-ts").OutputOf<TB["_ioTsType"]>, import("io-ts").OutputOf<TA["_ioTsType"]> | import("io-ts").OutputOf<TB["_ioTsType"]>>;
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
 *
 * @template {import('./types').Speck<any>} TA
 * @template {import('./types').Speck<any>} TB
 * @param {[TA, TB]} specks
 * @returns {import('./types').UnionType<[TA, TB]>}
 */
export function union<TA extends import("./types").Speck<any, any>, TB extends import("./types").Speck<any, any>>([speckA, speckB]: [TA, TB]): import("./types").NonObjectSpeck<import("io-ts").OutputOf<TA["_ioTsType"]> | import("io-ts").OutputOf<TB["_ioTsType"]>, import("io-ts").OutputOf<TA["_ioTsType"]> | import("io-ts").OutputOf<TB["_ioTsType"]>>;
/**
 * From a record of specks, pick which ones will be required fields and which
 * will be optional. e.g.
 *
 * ```js
 * const FIELDS = {
 *   type: s.literal('Spaceship'),
 *   fuel: s.positiveFloat,
 *   crew: s.array(Person),
 *   name: s.string,
 * };
 * const MannedShip = s.pickRequireds(FIELDS, ['type', 'fuel', 'crew']); // `name` is optional
 * const SemiAutonomousShip = s.pickRequireds(FIELDS, ['type', 'fuel']); // `crew` and `name` are optional
 * ```
 *
 * @template {import('./types')._BaseRecordOfSpecks} TRecordOfSpecks
 * @template {keyof TRecordOfSpecks} TRequiredFields
 * @param {TRecordOfSpecks} recordOfSpecks
 * @param {TRequiredFields[]} requiredFields
 * @returns {import('./types').IntersectionType<[
 *   import('./types').TypeType<Pick<TRecordOfSpecks, TRequiredFields>>,
 *   import('./types').PartialType<Omit<TRecordOfSpecks, TRequiredFields>>
 * ]>}
 */
export function pickRequireds<TRecordOfSpecks extends Record<string, import("./types").Speck<any, any>>, TRequiredFields extends keyof TRecordOfSpecks>(recordOfSpecks: TRecordOfSpecks, requiredFields: TRequiredFields[]): import("./types").ObjectSpeck<{ [K in keyof Pick<TRecordOfSpecks, TRequiredFields>]: import("io-ts").OutputOf<Pick<TRecordOfSpecks, TRequiredFields>[K]["_ioTsType"]>; } & { [K_1 in keyof Pick<TRecordOfSpecks, Exclude<keyof TRecordOfSpecks, TRequiredFields>>]?: import("io-ts").OutputOf<Pick<TRecordOfSpecks, Exclude<keyof TRecordOfSpecks, TRequiredFields>>[K_1]["_ioTsType"]> | null | undefined; }, { [K in keyof Pick<TRecordOfSpecks, TRequiredFields>]: import("io-ts").OutputOf<Pick<TRecordOfSpecks, TRequiredFields>[K]["_ioTsType"]>; } & { [K_1 in keyof Pick<TRecordOfSpecks, Exclude<keyof TRecordOfSpecks, TRequiredFields>>]?: import("io-ts").OutputOf<Pick<TRecordOfSpecks, Exclude<keyof TRecordOfSpecks, TRequiredFields>>[K_1]["_ioTsType"]> | null | undefined; }>;
/** API functions */
/**
 * Generate test data for a speck
 *
 * ```js
 * s.gen(C1Request, {
 *   organization: s.gen(Organization, {
 *     id: '...',
 *   }),
 * });
 * ```
 *
 * @template TUnderlyingType
 * @param {import('./types').Speck<TUnderlyingType>} speck
 * @param {Partial<TUnderlyingType> | null} overrides
 * @return {TUnderlyingType}
 */
export function gen<TUnderlyingType>(speck: import("./types").Speck<TUnderlyingType, TUnderlyingType>, overrides?: Partial<TUnderlyingType> | null): TUnderlyingType;
export class SpeckValidationErrors extends Error {
    /**
     * @param {import('fp-ts/lib/Either').Left<import('io-ts').Errors>} ioTsErrorResponse
     *   Response from running .decode from an io-ts type
     */
    constructor(ioTsErrorResponse: import('fp-ts/lib/Either').Left<import('io-ts').Errors>);
    summary: string[];
    /**
     * Highly detailed record of all the validation errors that were spotted.
     * This includes values for the expected types. This is a very handy record
     * for interacting with in a REPL or a debugger but will be overwhelming to
     * print to a string as it has a LOT of data.
     *
     * @type {import('io-ts').Errors | null | undefined}
     */
    errors: import('io-ts').Errors | null | undefined;
}
/**
 * @template TUnderlyingType
 * @param {import('./types').Speck<TUnderlyingType>} speck
 * @param {unknown} item
 * @param {object} options
 * @param {boolean} [options.skipStrict] If true, the validation will be not
 *   "strict" i.e. it will not strip out excessive fields.
 *   ! io-ts can return an error `no codec found to encode value in union type`
 *   when doing strict encoding on a type that includes unions. I'm not sure of
 *   the reason for this, but I suggest setting `skipStrict` to true if you
 *   run into this issue.
 *   Here's an example session demonstrating this option:
 *
 *   ```js
 *   > var s = require('@imin/speck')
 *   > var S = s.type({ x: s.float, y: s.float })
 *   > s.validate(S, { x: 12, y: 34, z: 56 }, { skipStrict: true })
 *   { x: 12, y: 34, z: 56 }
 *   > s.validate(S, { x: 12, y: 34, z: 56 }, { skipStrict: false })
 *   { x: 12, y: 34 }
 *   ```
 * @return {TUnderlyingType | SpeckValidationErrors}
 */
export function validate<TUnderlyingType>(speck: import("./types").Speck<TUnderlyingType, TUnderlyingType>, item: unknown, { skipStrict }?: {
    skipStrict: boolean | undefined;
}): SpeckValidationErrors | TUnderlyingType;
/**
 * It's like `s.validate(..)` but it just always throws the error. For vital assertions or quick experimentation.
 *
 * @template TUnderlyingType
 * @param {import('./types').Speck<TUnderlyingType>} speck
 * @param {unknown} item
 * @returns {TUnderlyingType}
 */
export function assert<TUnderlyingType>(speck: import("./types").Speck<TUnderlyingType, TUnderlyingType>, item: unknown): TUnderlyingType;
