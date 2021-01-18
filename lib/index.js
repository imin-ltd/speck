const t = require('io-ts');
const { default: ioTsReporters } = require('io-ts-reporters');
const fc = require('fast-check');
const { isLeft } = require('fp-ts/lib/Either');
const _ = require('lodash');
const moment = require('moment');
const { IsoDateTimeString, nonEmptyArray: nonEmptyArrayBrand } = require('./ioTsBrands');

// FIXME: Unfortunately, @typedefs cannot be placed into this file, as they
// will mess with the built TS, creating this error:
//
// ```
// node_modules/@imin/speck/lib/index.d.ts:32:1 - error TS2309: An export assignment cannot be used in a module with other exported elements.
//
// 32 export = _exports;
//    ~~~~~~~~~~~~~~~~~~k
// ```
//
// This is because TS treats all @typedefs as exports, which means that it
// builds this file in a way which seems to, contradictingly, be both an
// ES Module and a CommonJS module.

/**
 * @template TUnderlyingType
 * @template TIoTsStaticType
 *
 * @param {t.Type<TIoTsStaticType, TUnderlyingType>} ioTsType
 * @param {fc.Arbitrary<TUnderlyingType>} fastCheckArbitrary
 * @returns {import('./types').NonObjectSpeck<TUnderlyingType, TIoTsStaticType>}
 */
function createNonObjectSpeck(ioTsType, fastCheckArbitrary) {
  return {
    _ioTsType: ioTsType,
    _fastCheckArbitrary: fastCheckArbitrary,
    _isObjectType: false,
  };
}

/**
 * @template TUnderlyingType
 *
 * @param {t.Type<TUnderlyingType>} ioTsType
 * @param {fc.Arbitrary<TUnderlyingType>} fastCheckArbitrary
 * @param {boolean} allowsUnknown
 * @returns {import('./types').ObjectSpeck<TUnderlyingType>}
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
 *
 * @template {string | number | boolean} TLiteralValue
 *
 * @param {TLiteralValue} value
 */
function literal(value) {
  return createNonObjectSpeck(t.literal(value), fc.constant(value));
}

/**
 * - TypeScript: string
 * - Runtime Validation: is it a string?
 * - Generation: random string
 */
const string = createNonObjectSpeck(t.string, fc.string());

/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a URL)
 * - Generation: random URL
 */
const urlString = createNonObjectSpeck(t.string, fc.webUrl());

/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a email)
 * - Generation: random email
 */
const emailString = createNonObjectSpeck(t.string, fc.emailAddress());

/**
 * ISO-8601 Date time string e.g. 2001-01-01T01:23:45Z. Has seconds precision
 * and a timezone designator
 *
 * - TypeScript: string
 * - Runtime validation: is it an ISO-8601 datetime?
 * - Generation: Random ISO-8601 datetime string
 */
const isoDateTimeString = createNonObjectSpeck(
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
const float = createNonObjectSpeck(t.number, fc.float(-100, 100));

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
const nonNegativeFloat = createNonObjectSpeck(t.number, fc.float(0, 100));

/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeFloat */
const positiveFloat = nonNegativeFloat;

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
const int = createNonObjectSpeck(t.Int, fc.integer(-100, 100));

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
const nonNegativeInt = createNonObjectSpeck(t.Int, fc.integer(0, 100));

/** @deprecated Since v0.1.0. Replaced by the more accurately named nonNegativeInt */
const positiveInt = nonNegativeInt;

/**
 * Boolean
 *
 * - TypeScript: boolean
 * - Runtime validation: is it an boolean?
 * - Generation: Random boolean
 *
 */
const boolean = createNonObjectSpeck(t.boolean, fc.boolean());

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
function literalEnum(literalsArray) {
  const literalA = t.literal(literalsArray[0]);
  const literalB = t.literal(literalsArray[1]);
  const literalsRest = literalsArray.slice(2).map(l => t.literal(l));
  const ioTsType = t.union([literalA, literalB, ...literalsRest]);
  
  const fastCheckArbitrary = fc.oneof(...(literalsArray.map(l => fc.constant(l))));
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

/**
 * Enum of string literals
 *
 * @template {string} TLiteralValue
 *
 * @param {[TLiteralValue, TLiteralValue, ...TLiteralValue[]]} literalsArray 
 */
function literalStringEnum(literalsArray) {
  const literalA = t.literal(literalsArray[0]);
  const literalB = t.literal(literalsArray[1]);
  const literalsRest = literalsArray.slice(2).map(l => t.literal(l));
  const ioTsType = t.union([literalA, literalB, ...literalsRest]);
  
  const fastCheckArbitrary = fc.oneof(...(literalsArray.map(l => fc.constant(l))));
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

/**
 * Enum of number literals
 *
 * @template {number} TLiteralValue
 *
 * @param {[TLiteralValue, TLiteralValue, ...TLiteralValue[]]} literalsArray 
 */
function literalNumberEnum(literalsArray) {
  const literalA = t.literal(literalsArray[0]);
  const literalB = t.literal(literalsArray[1]);
  const literalsRest = literalsArray.slice(2).map(l => t.literal(l));
  const ioTsType = t.union([literalA, literalB, ...literalsRest]);
  
  const fastCheckArbitrary = fc.oneof(...(literalsArray.map(l => fc.constant(l))));
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

const unknownRecord = createObjectSpeck(
  t.UnknownRecord,
  // `fc.object()` returns an `Arbitrary<object>` type. TypeScript's handling
  // of the `object` type is rather odd. In some circumstances, it's identical
  // `any` and in some circumstances an empty object (`{}`).
  // e.g. `/** @type {object} */(someObject).someFieldName` will return an
  // error along the lines of "someFieldName does not exist on type `object`".
  // This is why I cast `fc.object()` to be an arbitrary for an object of
  // unknowns. This handles better and also aligns with io-ts's UnknownRecord.
  /** @type {import('fast-check').Arbitrary<{ [k: string]: unknown }>} */(fc.object()),
  true);

/** # Higher order types */

/**
 * Array of specks
 *
 * @template {import('./types').Speck<any>} TSpeck
 * @param {TSpeck} speck
 * @returns {import('./types').ArrayType<TSpeck>}
 */
function array(speck) {
  return createNonObjectSpeck(
    t.array(speck._ioTsType),
    fc.array(speck._fastCheckArbitrary));
}

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
function nonEmptyArray(speck) {
  return createNonObjectSpeck(
    nonEmptyArrayBrand(speck._ioTsType),
    fc.array(speck._fastCheckArbitrary, 1, 5));
}

/**
 * Used to get a record of io-ts types and a record of fast-check Arbitraries
 * from a record of Specks
 *
 * @template {import('./types')._BaseRecordOfSpecks} TRecordOfSpecks
 * @param {TRecordOfSpecks} recordOfSpecks
 * @param {object} [options]
 * @param {boolean} [options.areFieldsNilable] If true, fields will be treated as "nil"able.
 *   This means that they can also be `null` or `undefined`.
 * @returns {{
 *   ioTsTypes: {
 *     [K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_ioTsType']
 *   },
 *   fastCheckArbitraries: {
 *     [K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_fastCheckArbitrary']
 *   }
 * }}
 */
function getIoTsTypesAndFastCheckArbitraries(recordOfSpecks, { areFieldsNilable } = {}) {
  // Unfortunately these types have to be Partial because there's no way (as
  // far as I can tell?) to inform TypeScript that they will be filled with
  // every key once the for loop iteration has completed.
  // `reduce()` feels like the right solution, but, again, TypeScript will not
  // differentiate between the intermediate state and the final state.
  /** @type {Partial<{[K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_ioTsType']}>} */
  const ioTsTypes = {};
  /** @type {Partial<{[K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_fastCheckArbitrary']}>} */
  const fastCheckArbitraries = {};
  for (const key in recordOfSpecks) {
    const initialIoTsType =  recordOfSpecks[key]._ioTsType;
    ioTsTypes[key] = areFieldsNilable
      ? t.union([initialIoTsType, t.null, t.undefined])
      : initialIoTsType;
    fastCheckArbitraries[key] = recordOfSpecks[key]._fastCheckArbitrary;
  }
  return {
    ioTsTypes: /** @type {{[K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_ioTsType']}} */(ioTsTypes),
    fastCheckArbitraries: /** @type {{[K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_fastCheckArbitrary']}} */(fastCheckArbitraries),
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
 *
 * @template {import('./types')._BaseRecordOfSpecks} TRecordOfSpecks
 * @param {TRecordOfSpecks} recordOfSpecks
 * @returns {import('./types').TypeType<TRecordOfSpecks>}
 */
function type(recordOfSpecks) {
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
 *
 * @template {import('./types')._BaseRecordOfSpecks} TRecordOfSpecks
 * @param {TRecordOfSpecks} recordOfSpecks
 * @returns {import('./types').PartialType<TRecordOfSpecks>}
 */
function partial(recordOfSpecks) {
  const { ioTsTypes, fastCheckArbitraries } = getIoTsTypesAndFastCheckArbitraries(recordOfSpecks, { areFieldsNilable: true });
  return createObjectSpeck(
    t.partial(ioTsTypes),
    fc.record(fastCheckArbitraries, { withDeletedKeys: true }));
}

/**
 * _TODO document_
 *
 * @template {import('./types').ObjectSpeck<any>} TA
 * @template {import('./types').ObjectSpeck<any>} TB
 * @param {[TA, TB]} specks
 * @returns {import('./types').IntersectionType<[TA, TB]>}
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
function unionObjects([speckA, speckB]) {
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
 *
 * @template {import('./types').Speck<any>} TA
 * @template {import('./types').Speck<any>} TB
 * @param {[TA, TB]} specks
 * @returns {import('./types').UnionType<[TA, TB]>}
 */
function union([speckA, speckB]) {
  const ioTsType = t.union([speckA._ioTsType, speckB._ioTsType]);
  const fastCheckArbitrary = fc.oneof(speckA._fastCheckArbitrary, speckB._fastCheckArbitrary);
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

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
function pickRequireds(recordOfSpecks, requiredFields) {
  const requireds = type(_.pick(recordOfSpecks, requiredFields));
  const optionals = partial(_.omit(recordOfSpecks, requiredFields));
  return intersection([requireds, optionals]);
}

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
class SpeckValidationErrors extends Error {
  /**
   * @param {import('fp-ts/lib/Either').Left<import('io-ts').Errors>} ioTsErrorResponse
   *   Response from running .decode from an io-ts type
   */
  constructor(ioTsErrorResponse) {
    // TODO would be good to have a Speck name here, but we don't record names for types..
    // Then we could say something like "Validation error for type `MyType`"
    super('Validation Error');
    this.name = 'SpeckValidationErrors';
    this.summary = ioTsReporters.report(ioTsErrorResponse);
    /**
     * Much more brief summary of each of the errors spotted. e.g.
     *
     * ```js
     * [ 'Expecting number at 1.price but instead got: "not a number"' ]
     * ```
     *
     * Note that the path (`1.price` above) is a path within the speck, not a
     * path within the data type itself. So `1` may refer to the 2nd item in
     * an intersection.
     *
     * @type {string[]}
     */
    // @ts-expect-error Hack to make this only read env var if `process` is recognised (and therefore,
    // probably we're in a Node.js environment).
    // Speck works with browser code as well as Node.js code, which is why this is needed.
    if (typeof process !== 'undefined' && process.env.SPECK_ERROR_EXCLUDE_DETAIL === 'true') {
      // Do not set `errors` as we don't want that level of detail
    } else {
      /**
       * Highly detailed record of all the validation errors that were spotted.
       * This includes values for the expected types. This is a very handy record
       * for interacting with in a REPL or a debugger but will be overwhelming to
       * print to a string as it has a LOT of data.
       *
       * @type {import('io-ts').Errors | null | undefined}
       */
      this.errors = ioTsErrorResponse.left;
    }
  }
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
function validate(speck, item, { skipStrict = false } = { }) {
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
    ? t.exact(/** @type {import('io-ts').HasProps} */ (speck._ioTsType)).decode(item)
    : speck._ioTsType.decode(item);

  if (isLeft(validationResult)) {
    return new SpeckValidationErrors(validationResult);
  }
  return speck._ioTsType.encode(validationResult.right);
}

/**
 * It's like `s.validate(..)` but it just always throws the error. For vital assertions or quick experimentation.
 *
 * @template TUnderlyingType
 * @param {import('./types').Speck<TUnderlyingType>} speck
 * @param {unknown} item
 * @returns {TUnderlyingType}
 */
function assert(speck, item) {
  const result = validate(speck, item, { skipStrict: true });
  if (result instanceof SpeckValidationErrors) {
    throw result;
  }
  return result;
}

module.exports = {
  // Simple types
  literal,
  string,
  urlString,
  emailString,
  isoDateTimeString,
  float,
  nonNegativeFloat,
  positiveFloat,
  int,
  nonNegativeInt,
  positiveInt,
  boolean,
  unknownRecord,
  // Higher order types
  array,
  nonEmptyArray,
  literalEnum,
  literalStringEnum,
  literalNumberEnum,
  type,
  partial,
  intersection,
  unionObjects,
  union,
  pickRequireds,
  // API functions
  gen,
  SpeckValidationErrors,
  validate,
  assert,
};
