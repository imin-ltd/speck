import * as t from 'io-ts';
import ioTsReporters from 'io-ts-reporters';
import * as fc from 'fast-check';
import {
  ArrayType,
  IntersectionType,
  NonEmptyBrandedArrayType,
  NonObjectSpeck,
  ObjectSpeck,
  PartialType,
  RecordType,
  Speck,
  TypeType,
  UnionObjectsType,
  UnionType,
  _BaseRecordOfSpecks,
} from './types';
import { isLeft, Left } from 'fp-ts/lib/Either';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
  IsoDateTimeString,
  nonEmptyArray as nonEmptyArrayBrand,
} from './ioTsBrands';
import { ioTsBigInt, ioTsJsDate } from './ioTsTypes';
// Export types from ./types
export { TypeOf, Speck } from './types';

function createNonObjectSpeck<TUnderlyingType, TIoTsStaticType>(
  ioTsType: t.Type<TIoTsStaticType, TUnderlyingType>,
  fastCheckArbitrary: fc.Arbitrary<TUnderlyingType>,
): NonObjectSpeck<TUnderlyingType, TIoTsStaticType> {
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
function createObjectSpeck<TUnderlyingType>(
  ioTsType: t.Type<TUnderlyingType>,
  fastCheckArbitrary: fc.Arbitrary<TUnderlyingType>,
  allowsUnknown: boolean = false
): ObjectSpeck<TUnderlyingType> {
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
export function literal<TLiteralValue extends string | number | boolean>(value: TLiteralValue) {
  return createNonObjectSpeck(t.literal(value), fc.constant(value));
}

/**
 * - TypeScript: string
 * - Runtime Validation: is it a string?
 * - Generation: random string
 */
export const string = createNonObjectSpeck(t.string, fc.string());

/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a URL)
 * - Generation: random URL
 */
export const urlString = createNonObjectSpeck(t.string, fc.webUrl());

/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a email)
 * - Generation: random email
 */
export const emailString = createNonObjectSpeck(t.string, fc.emailAddress());

/**
 * ISO-8601 Date time string e.g. 2001-01-01T01:23:45Z. Has seconds precision
 * and a timezone designator
 *
 * - TypeScript: string
 * - Runtime validation: is it an ISO-8601 datetime?
 * - Generation: Random ISO-8601 datetime string
 */
export const isoDateTimeString = createNonObjectSpeck(
  IsoDateTimeString,
  fc.date({
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
export const float = createNonObjectSpeck(t.number, fc.float(-100, 100));

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
export const nonNegativeFloat = createNonObjectSpeck(t.number, fc.float(0, 100));

/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeFloat */
export const positiveFloat = nonNegativeFloat;

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
export const int = createNonObjectSpeck(t.Int, fc.integer(-100, 100));

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
export const nonNegativeInt = createNonObjectSpeck(t.Int, fc.integer(0, 100));

/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeInt */
export const positiveInt = nonNegativeInt;

/**
 * Boolean
 *
 * - TypeScript: boolean
 * - Runtime validation: is it an boolean?
 * - Generation: Random boolean
 */
export const boolean = createNonObjectSpeck(t.boolean, fc.boolean());

/**
 * JS Date (e.g. `new Date()`)
 *
 * - TypeScript: Date
 * - Runtime validation: instanceof Date
 * - Generation: Random Date
 */
export const jsDate = createNonObjectSpeck(ioTsJsDate, fc.date());

/**
 * BigInt (e.g. `123n`)
 *
 * - TypeScript: bigint
 * - Runtime validation: typeof x === 'bigint'
 * - Generation: Random BigInt
 */
export const bigInt = createNonObjectSpeck(ioTsBigInt, fc.bigInt());

/**
 * `null` or `undefined`
 */
export const nil = createNonObjectSpeck(
  t.union([t.null, t.undefined]),
  fc.boolean().map(trueOrFalse => trueOrFalse ? null : undefined),
);

/**
 * Enum of string literals
 */
export function literalStringEnum<TLiteralValue extends string>(
  literalsArray: [TLiteralValue, TLiteralValue, ...TLiteralValue[]],
) {
  const literalA = t.literal(literalsArray[0]);
  const literalB = t.literal(literalsArray[1]);
  const literalsRest = literalsArray.slice(2).map(l => t.literal(l));
  const ioTsType = t.union([literalA, literalB, ...literalsRest]);
  
  const fastCheckArbitrary = fc.oneof(...(literalsArray.map(l => fc.constant(l))));
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

/**
 * Enum of number literals
 */
export function literalNumberEnum<TLiteralValue extends number>(
  literalsArray: [TLiteralValue, TLiteralValue, ...TLiteralValue[]],
) {
  const literalA = t.literal(literalsArray[0]);
  const literalB = t.literal(literalsArray[1]);
  const literalsRest = literalsArray.slice(2).map(l => t.literal(l));
  const ioTsType = t.union([literalA, literalB, ...literalsRest]);
  
  const fastCheckArbitrary = fc.oneof(...(literalsArray.map(l => fc.constant(l))));
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

export const unknownRecord = createObjectSpeck(
  t.UnknownRecord,
  // `fc.object()` returns an `Arbitrary<object>` type. TypeScript's handling
  // of the `object` type is rather odd. In some circumstances, it's identical
  // `any` and in some circumstances an empty object (`{}`).
  // e.g. `/** @type {object} */(someObject).someFieldName` will return an
  // error along the lines of "someFieldName does not exist on type `object`".
  // This is why I cast `fc.object()` to be an arbitrary for an object of
  // unknowns. This handles better and also aligns with io-ts's UnknownRecord.
  fc.object() as fc.Arbitrary<{ [k: string]: unknown }>,
  true);

export const unknown = createNonObjectSpeck(t.unknown, fc.anything())

/** # Higher order types */

/**
 * Array of specks
 */
export function array<TSpeck extends Speck<any>>(speck: TSpeck): ArrayType<TSpeck> {
  return createNonObjectSpeck(
    t.array(speck._ioTsType),
    fc.array(speck._fastCheckArbitrary));
}

/**
 * Array of specks where there must be at least one element in the array.
 * 
 * Unfortunately fastcheck requires a maxLength when defining a minLength. It has been set to 5 initially,
 * if this is not enough, this can be increased.
 */
export function nonEmptyArray<TSpeck extends Speck<any>>(speck: TSpeck): NonEmptyBrandedArrayType<TSpeck> {
  return createNonObjectSpeck(
    nonEmptyArrayBrand(speck._ioTsType),
    fc.array(speck._fastCheckArbitrary, 1, 5));
}

/**
 * The speck equivalent of the TypeScript `Record<..>` type.
 *
 * e.g. `s.record(s.string, s.float)` would have TS type `Record<string, number>`.
 */
export function record<
  TKeySpeck extends typeof string,
  TValueSpeck extends Speck<any>
>(keySpeck: TKeySpeck, valueSpeck: TValueSpeck): RecordType<TKeySpeck, TValueSpeck> {
  // TODO fix the type here
  return createObjectSpeck(
    t.record(keySpeck._ioTsType, valueSpeck._ioTsType),
    fc.dictionary(keySpeck._fastCheckArbitrary, valueSpeck._fastCheckArbitrary)) as any;
}

/**
 * Used to get a record of io-ts types and a record of fast-check Arbitraries
 * from a record of Specks
 */
function getIoTsTypesAndFastCheckArbitraries<
TRecordOfSpecks extends _BaseRecordOfSpecks,
>(
  recordOfSpecks: TRecordOfSpecks,
  { areFieldsNilable }: {
    /**
     * If true, fields will be treated as "nil"able.
     * This means that they can also be `null` or `undefined`.
     */
    areFieldsNilable?: boolean,
  } = {}
): {
  ioTsTypes: {
    [K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_ioTsType'];
  },
  fastCheckArbitraries: {
    [K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_fastCheckArbitrary'];
  },
} {
  // Unfortunately these types have to be Partial because there's no way (as
  // far as I can tell?) to inform TypeScript that they will be filled with
  // every key once the for loop iteration has completed.
  // `reduce()` feels like the right solution, but, again, TypeScript will not
  // differentiate between the intermediate state and the final state.
  const ioTsTypes: Partial<{[K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_ioTsType']}> = {};
  const fastCheckArbitraries: Partial<{[K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_fastCheckArbitrary']}> = {};
  for (const key in recordOfSpecks) {
    const initialIoTsType =  recordOfSpecks[key]._ioTsType;
    ioTsTypes[key] = areFieldsNilable
      ? t.union([initialIoTsType, t.null, t.undefined])
      : initialIoTsType;
    fastCheckArbitraries[key] = recordOfSpecks[key]._fastCheckArbitrary;
  }
  return {
    ioTsTypes: ioTsTypes as {[K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_ioTsType']},
    fastCheckArbitraries: fastCheckArbitraries as {[K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_fastCheckArbitrary']},
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
export function type<TRecordOfSpecks extends _BaseRecordOfSpecks>(recordOfSpecks: TRecordOfSpecks): TypeType<TRecordOfSpecks> {
  const { ioTsTypes, fastCheckArbitraries } = getIoTsTypesAndFastCheckArbitraries(recordOfSpecks);
  return createObjectSpeck(
    t.type(ioTsTypes),
    fc.record(fastCheckArbitraries));
}

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
export function partial<
  TRecordOfSpecks extends _BaseRecordOfSpecks
>(recordOfSpecks: TRecordOfSpecks): PartialType<TRecordOfSpecks> {
  const { ioTsTypes, fastCheckArbitraries } = getIoTsTypesAndFastCheckArbitraries(
    recordOfSpecks, { areFieldsNilable: true });
  return createObjectSpeck(
    t.partial(ioTsTypes),
    fc.record(fastCheckArbitraries, { withDeletedKeys: true }));
}

/**
 * Combine two Specks in a way that is equivalent to TypeScript's `&` operator.
 *
 * e.g. `s.intersection(s.type({ abc: s.string }), s.partial({ def: s.number }))`
 * will create a Speck with a required `abc` field and an optional `def` field.
 *
 * This can only be used on ObjectSpecks, as intersections do not make any sense on atomic
 * types. e.g. what is `3 & null`? There is no intersection between those two types.
 */
export function intersection<
  TA extends ObjectSpeck<any>,
  TB extends ObjectSpeck<any>,
>([speckA, speckB]: [TA, TB]): IntersectionType<[TA, TB]> {
  const ioTsType = t.intersection([speckA._ioTsType, speckB._ioTsType]);
  const fastCheckArbitrary = fc.tuple(speckA._fastCheckArbitrary, speckB._fastCheckArbitrary)
    .map(values => Object.assign({}, ...values));
  // If either of the combined specks allows unknown fields, then their
  // intersection naturally also allows unknown fields
  const allowsUnknown = speckA._allowsUnknown || speckB._allowsUnknown;
  return createObjectSpeck(ioTsType, fastCheckArbitrary, allowsUnknown);
}

/**
 * Equivalent to `s.union(..)` but is defined specifically for ObjectSpecks. This allows the resulting
 * type to maintain its ObjectSpeck status and therefore be usable for intersections.
 *
 * For more info, See: `s.union(..)`.
 */
export function unionObjects<
  TA extends ObjectSpeck<any>,
  TB extends ObjectSpeck<any>,
>([speckA, speckB]: [TA, TB]): UnionObjectsType<[TA, TB]> {
  const ioTsType = t.union([speckA._ioTsType, speckB._ioTsType]);
  const fastCheckArbitrary = fc.oneof(speckA._fastCheckArbitrary, speckB._fastCheckArbitrary);
  return createObjectSpeck(ioTsType, fastCheckArbitrary);
}

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
export function union<
  TA extends Speck<any>,
  TB extends Speck<any>,
>([speckA, speckB]: [TA, TB]): UnionType<[TA, TB]> {
  const ioTsType = t.union([speckA._ioTsType, speckB._ioTsType]);
  const fastCheckArbitrary = fc.oneof(speckA._fastCheckArbitrary, speckB._fastCheckArbitrary);
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

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
export function pickRequireds<
  TRecordOfSpecks extends _BaseRecordOfSpecks,
  TRequiredFields extends keyof TRecordOfSpecks,
>(recordOfSpecks: TRecordOfSpecks, requiredFields: TRequiredFields[]): IntersectionType<[
  TypeType<Pick<TRecordOfSpecks, TRequiredFields>>,
  PartialType<Omit<TRecordOfSpecks, TRequiredFields>>,
]> {
  const requireds = type(_.pick(recordOfSpecks, requiredFields));
  const optionals = partial(_.omit(recordOfSpecks, requiredFields));
  return intersection([requireds, optionals]);
}

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
export function gen<TUnderlyingType>(
  speck: Speck<TUnderlyingType>,
  overrides: Partial<TUnderlyingType | null> = null,
): TUnderlyingType {
  const sampleResult = fc.sample(speck._fastCheckArbitrary, 1)[0];
  if (speck._isObjectType && overrides) {
    return Object.assign({}, sampleResult, overrides);
  }
  return sampleResult;
}

export class SpeckValidationErrors extends Error {
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
  constructor(ioTsErrorResponse: Left<t.Errors>) {
    // TODO would be good to have a Speck name here, but we don't record names for types..
    // Then we could say something like "Validation error for type `MyType`"
    super('Validation Error');
    this.name = 'SpeckValidationErrors';
    this.summary = ioTsReporters.report(ioTsErrorResponse);
    // @ts-expect-error Hack to make this only read env var if `process` is recognised (and therefore,
    // probably we're in a Node.js environment).
    // Speck works with browser code as well as Node.js code, which is why this is needed.
    if (typeof process !== 'undefined' && process.env.SPECK_ERROR_EXCLUDE_DETAIL === 'true') {
      // Do not set `errors` as we don't want that level of detail
    } else {
      this.errors = ioTsErrorResponse.left;
    }
  }
}

export function validate<TUnderlyingType>(
  speck: Speck<TUnderlyingType>,
  item: unknown,
  { skipStrict = false }: {
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
    skipStrict?: boolean,
  } = { },
): TUnderlyingType | SpeckValidationErrors {
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
    ? t.exact(speck._ioTsType as t.HasProps).decode(item)
    : speck._ioTsType.decode(item);

  if (isLeft(validationResult)) {
    return new SpeckValidationErrors(validationResult);
  }
  return speck._ioTsType.encode(validationResult.right);
}

/**
 * It's like `s.validate(..)` but it just always throws the error. For vital assertions or quick experimentation.
 */
export function assert<TUnderlyingType>(
  speck: Speck<TUnderlyingType>,
  item: unknown,
): TUnderlyingType {
  const result = validate(speck, item, { skipStrict: true });
  if (result instanceof SpeckValidationErrors) {
    throw result;
  }
  return result;
}
