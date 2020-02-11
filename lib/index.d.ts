declare const _exports: {
    literal: typeof literal;
    string: import("./types").NonObjectSpeck<string, string>;
    urlString: import("./types").NonObjectSpeck<string, string>;
    emailString: import("./types").NonObjectSpeck<string, string>;
    isoDateTimeString: import("./types").NonObjectSpeck<string, import("io-ts").Branded<string, import("./types").IsoDateTimeStringBrand>>;
    float: import("./types").NonObjectSpeck<number, number>;
    positiveFloat: import("./types").NonObjectSpeck<number, number>;
    int: import("./types").NonObjectSpeck<number, import("io-ts").Branded<number, import("io-ts").IntBrand>>;
    positiveInt: import("./types").NonObjectSpeck<number, import("io-ts").Branded<number, import("io-ts").IntBrand>>;
    boolean: import("./types").NonObjectSpeck<boolean, boolean>;
    array: typeof array;
    literalEnum: typeof literalEnum;
    type: typeof type;
    partial: typeof partial;
    intersection: typeof intersection;
    unionObjects: typeof unionObjects;
    union: typeof union;
    pickRequireds: typeof pickRequireds;
    gen: typeof gen;
    SpeckValidationErrors: typeof SpeckValidationErrors;
    validate: typeof validate;
};
export = _exports;
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
declare function literal<TLiteralValue extends string | number | boolean>(value: TLiteralValue): import("./types").NonObjectSpeck<TLiteralValue, TLiteralValue>;
/** # Higher order types */
/**
 * Array of specks
 *
 * @template {import('./types').Speck<any>} TSpeck
 * @param {TSpeck} speck
 * @returns {import('./types').ArrayType<TSpeck>}
 */
declare function array<TSpeck extends import("./types").Speck<any, any>>(speck: TSpeck): import("./types").NonObjectSpeck<TSpeck["_ioTsType"]["_O"][], TSpeck["_ioTsType"]["_O"][]>;
/**
 * Enum of string literals
 * TODO Typescript type of return object is too vague (returns string instead of 'abc' for example).
 *
 * @template {string} TString
 * @template {[TString, TString, ...TString[]]} TStrings
 *
 * @param {TStrings} stringLiteralsArray
 */
declare function literalEnum<TString extends string, TStrings extends [TString, TString, ...TString[]]>(stringLiteralsArray: TStrings): import("./types").NonObjectSpeck<TString, TString>;
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
declare function type<TRecordOfSpecks extends Record<string, import("./types").Speck<any, any>>>(recordOfSpecks: TRecordOfSpecks): import("./types").ObjectSpeck<{ [K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]["_ioTsType"]["_O"]; }, { [K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]["_ioTsType"]["_O"]; }>;
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
 * @template {import('./types')._BaseRecordOfSpecks} TRecordOfSpecks
 * @param {TRecordOfSpecks} recordOfSpecks
 * @returns {import('./types').PartialType<TRecordOfSpecks>}
 */
declare function partial<TRecordOfSpecks extends Record<string, import("./types").Speck<any, any>>>(recordOfSpecks: TRecordOfSpecks): import("./types").ObjectSpeck<{ [K in keyof TRecordOfSpecks]?: TRecordOfSpecks[K]["_ioTsType"]["_O"] | undefined; }, { [K in keyof TRecordOfSpecks]?: TRecordOfSpecks[K]["_ioTsType"]["_O"] | undefined; }>;
/**
 * _TODO document_
 *
 * @template {import('./types').ObjectSpeck<any>} TA
 * @template {import('./types').ObjectSpeck<any>} TB
 * @param {[TA, TB]} specks
 * @returns {import('./types').IntersectionType<[TA, TB]>}
 */
declare function intersection<TA extends import("./types").ObjectSpeck<any, any>, TB extends import("./types").ObjectSpeck<any, any>>([speckA, speckB]: [TA, TB]): import("./types").ObjectSpeck<TA["_ioTsType"]["_O"] & TB["_ioTsType"]["_O"], TA["_ioTsType"]["_O"] & TB["_ioTsType"]["_O"]>;
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
declare function unionObjects<TA extends import("./types").ObjectSpeck<any, any>, TB extends import("./types").ObjectSpeck<any, any>>([speckA, speckB]: [TA, TB]): import("./types").ObjectSpeck<TA["_ioTsType"]["_O"] | TB["_ioTsType"]["_O"], TA["_ioTsType"]["_O"] | TB["_ioTsType"]["_O"]>;
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
declare function union<TA extends import("./types").Speck<any, any>, TB extends import("./types").Speck<any, any>>([speckA, speckB]: [TA, TB]): import("./types").NonObjectSpeck<TA["_ioTsType"]["_O"] | TB["_ioTsType"]["_O"], TA["_ioTsType"]["_O"] | TB["_ioTsType"]["_O"]>;
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
declare function pickRequireds<TRecordOfSpecks extends Record<string, import("./types").Speck<any, any>>, TRequiredFields extends keyof TRecordOfSpecks>(recordOfSpecks: TRecordOfSpecks, requiredFields: TRequiredFields[]): import("./types").ObjectSpeck<{ [K in keyof Pick<TRecordOfSpecks, TRequiredFields>]: Pick<TRecordOfSpecks, TRequiredFields>[K]["_ioTsType"]["_O"]; } & { [K_1 in keyof Pick<TRecordOfSpecks, Exclude<keyof TRecordOfSpecks, TRequiredFields>>]?: Pick<TRecordOfSpecks, Exclude<keyof TRecordOfSpecks, TRequiredFields>>[K_1]["_ioTsType"]["_O"] | undefined; }, { [K in keyof Pick<TRecordOfSpecks, TRequiredFields>]: Pick<TRecordOfSpecks, TRequiredFields>[K]["_ioTsType"]["_O"]; } & { [K_1 in keyof Pick<TRecordOfSpecks, Exclude<keyof TRecordOfSpecks, TRequiredFields>>]?: Pick<TRecordOfSpecks, Exclude<keyof TRecordOfSpecks, TRequiredFields>>[K_1]["_ioTsType"]["_O"] | undefined; }>;
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
declare function gen<TUnderlyingType>(speck: import("./types").Speck<TUnderlyingType, TUnderlyingType>, overrides?: Partial<TUnderlyingType> | null): TUnderlyingType;
declare class SpeckValidationErrors extends Error {
    /**
     * @param {import('io-ts').Errors} ioTsErrors
     */
    constructor(ioTsErrors: import("io-ts").Errors);
    errors: import("io-ts").Errors;
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
declare function validate<TUnderlyingType>(speck: import("./types").Speck<TUnderlyingType, TUnderlyingType>, item: unknown, { skipStrict }?: {
    skipStrict?: boolean;
}): SpeckValidationErrors | TUnderlyingType;
