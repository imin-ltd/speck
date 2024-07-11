import * as t from 'io-ts';
import { ArrayType, IntersectionType, NonEmptyBrandedArrayType, NonObjectSpeck, ObjectSpeck, PartialType, RecordType, Speck, TypeType, UnionObjectsType, UnionType, _BaseRecordOfSpecks } from './types';
import { Left } from 'fp-ts/lib/Either';
export { TypeOf, Speck } from './types';
/** # Simple types */
/**
 * Literal type. An item with this type can only have one exact value.
 *
 * - TypeScript: Literal
 * - Runtime Validation: is it this exact literal?
 * - Generation: the literal value
 */
export declare function literal<TLiteralValue extends string | number | boolean>(value: TLiteralValue): NonObjectSpeck<TLiteralValue, TLiteralValue>;
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string?
 * - Generation: random string
 */
export declare const string: NonObjectSpeck<string, string>;
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a URL)
 * - Generation: random URL
 */
export declare const urlString: NonObjectSpeck<string, string>;
/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a email)
 * - Generation: random email
 */
export declare const emailString: NonObjectSpeck<string, string>;
/**
 * ISO-8601 Date time string e.g. 2001-01-01T01:23:45Z. Has seconds precision
 * and a timezone designator
 *
 * - TypeScript: string
 * - Runtime validation: is it an ISO-8601 datetime?
 * - Generation: Random ISO-8601 datetime string
 */
export declare const isoDateTimeString: NonObjectSpeck<string, t.Branded<string, import("./types").IsoDateTimeStringBrand>>;
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
export declare const float: NonObjectSpeck<number, number>;
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
export declare const nonNegativeFloat: NonObjectSpeck<number, number>;
/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeFloat */
export declare const positiveFloat: NonObjectSpeck<number, number>;
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
export declare const int: NonObjectSpeck<number, t.Branded<number, t.IntBrand>>;
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
export declare const nonNegativeInt: NonObjectSpeck<number, t.Branded<number, t.IntBrand>>;
/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeInt */
export declare const positiveInt: NonObjectSpeck<number, t.Branded<number, t.IntBrand>>;
/**
 * Boolean
 *
 * - TypeScript: boolean
 * - Runtime validation: is it an boolean?
 * - Generation: Random boolean
 */
export declare const boolean: NonObjectSpeck<boolean, boolean>;
/**
 * JS Date (e.g. `new Date()`)
 *
 * - TypeScript: Date
 * - Runtime validation: instanceof Date
 * - Generation: Random Date
 */
export declare const jsDate: NonObjectSpeck<Date, Date>;
/**
 * BigInt (e.g. `123n`)
 *
 * - TypeScript: bigint
 * - Runtime validation: typeof x === 'bigint'
 * - Generation: Random BigInt
 */
export declare const bigInt: NonObjectSpeck<bigint, bigint>;
/**
 * `null` or `undefined`
 */
export declare const nil: NonObjectSpeck<null | undefined, null | undefined>;
/**
 * Enum of string literals
 */
export declare function literalStringEnum<TLiteralValue extends string>(literalsArray: [TLiteralValue, TLiteralValue, ...TLiteralValue[]]): NonObjectSpeck<TLiteralValue, TLiteralValue>;
/**
 * Enum of number literals
 */
export declare function literalNumberEnum<TLiteralValue extends number>(literalsArray: [TLiteralValue, TLiteralValue, ...TLiteralValue[]]): NonObjectSpeck<TLiteralValue, TLiteralValue>;
export declare const unknownRecord: ObjectSpeck<{
    [k: string]: unknown;
}>;
export declare const unknown: NonObjectSpeck<unknown, unknown>;
/** # Higher order types */
/**
 * Array of specks
 */
export declare function array<TSpeck extends Speck<any>>(speck: TSpeck): ArrayType<TSpeck>;
/**
 * Array of specks where there must be at least one element in the array.
 *
 * Unfortunately fastcheck requires a maxLength when defining a minLength. It has been set to 5 initially,
 * if this is not enough, this can be increased.
 */
export declare function nonEmptyArray<TSpeck extends Speck<any>>(speck: TSpeck): NonEmptyBrandedArrayType<TSpeck>;
/**
 * The speck equivalent of the TypeScript `Record<..>` type.
 *
 * e.g. `s.record(s.string, s.float)` would have TS type `Record<string, number>`.
 */
export declare function record<TKeySpeck extends typeof string, TValueSpeck extends Speck<any>>(keySpeck: TKeySpeck, valueSpeck: TValueSpeck): RecordType<TKeySpeck, TValueSpeck>;
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
export declare function type<TRecordOfSpecks extends _BaseRecordOfSpecks>(recordOfSpecks: TRecordOfSpecks): TypeType<TRecordOfSpecks>;
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
export declare function partial<TRecordOfSpecks extends _BaseRecordOfSpecks>(recordOfSpecks: TRecordOfSpecks): PartialType<TRecordOfSpecks>;
/**
 * Combine two Specks in a way that is equivalent to TypeScript's `&` operator.
 *
 * e.g. `s.intersection(s.type({ abc: s.string }), s.partial({ def: s.number }))`
 * will create a Speck with a required `abc` field and an optional `def` field.
 *
 * This can only be used on ObjectSpecks, as intersections do not make any sense on atomic
 * types. e.g. what is `3 & null`? There is no intersection between those two types.
 */
export declare function intersection<TA extends ObjectSpeck<any>, TB extends ObjectSpeck<any>>([speckA, speckB]: [TA, TB]): IntersectionType<[TA, TB]>;
/**
 * Equivalent to `s.union(..)` but is defined specifically for ObjectSpecks. This allows the resulting
 * type to maintain its ObjectSpeck status and therefore be usable for intersections.
 *
 * For more info, See: `s.union(..)`.
 */
export declare function unionObjects<TA extends ObjectSpeck<any>, TB extends ObjectSpeck<any>>([speckA, speckB]: [TA, TB]): UnionObjectsType<[TA, TB]>;
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
export declare function union<TA extends Speck<any>, TB extends Speck<any>>([speckA, speckB]: [TA, TB]): UnionType<[TA, TB]>;
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
export declare function pickRequireds<TRecordOfSpecks extends _BaseRecordOfSpecks, TRequiredFields extends keyof TRecordOfSpecks>(recordOfSpecks: TRecordOfSpecks, requiredFields: TRequiredFields[]): IntersectionType<[
    TypeType<Pick<TRecordOfSpecks, TRequiredFields>>,
    PartialType<Omit<TRecordOfSpecks, TRequiredFields>>
]>;
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
export declare function gen<TUnderlyingType>(speck: Speck<TUnderlyingType>, overrides?: Partial<TUnderlyingType | null>): TUnderlyingType;
export declare class SpeckValidationErrors extends Error {
    /**
     * Much more brief summary of each of the errors spotted. e.g.
     *
     * ```ts
     * [ 'Expecting number at 1.price but instead got: "not a number"' ]
     * ```
     *
     * Note that the path (`1.price` above) is a path within the speck, not a
     * path within the data type itself. So `1` may refer to the 2nd item in
     * an intersection.
     */
    summary: string[];
    /**
     * Highly detailed record of all the validation errors that were spotted.
     * This includes values for the expected types. This is a very handy record
     * for interacting with in a REPL or a debugger but will be overwhelming to
     * print to a string as it has a LOT of data.
     */
    errors?: t.Errors;
    /**
     * @param ioTsErrorResponse Response from running .decode from an io-ts type
     */
    constructor(ioTsErrorResponse: Left<t.Errors>);
}
export declare function validate<TUnderlyingType>(speck: Speck<TUnderlyingType>, item: unknown, { skipStrict }?: {
    /**
     * If true, the validation will be not
     * "strict" i.e. it will not strip out excessive fields.
     * ! io-ts can return an error `no codec found to encode value in union type`
     * when doing strict encoding on a type that includes unions. I'm not sure of
     * the reason for this, but I suggest setting `skipStrict` to true if you
     * run into this issue.
     * Here's an example session demonstrating this option:
     *
     * ```js
     * > var s = require('@imin/speck')
     * > var S = s.type({ x: s.float, y: s.float })
     * > s.validate(S, { x: 12, y: 34, z: 56 }, { skipStrict: true })
     * { x: 12, y: 34, z: 56 }
     * > s.validate(S, { x: 12, y: 34, z: 56 }, { skipStrict: false })
     * { x: 12, y: 34 }
     * ```
     */
    skipStrict?: boolean;
}): TUnderlyingType | SpeckValidationErrors;
/**
 * It's like `s.validate(..)` but it just always throws the error. For vital assertions or quick experimentation.
 */
export declare function assert<TUnderlyingType>(speck: Speck<TUnderlyingType>, item: unknown): TUnderlyingType;
