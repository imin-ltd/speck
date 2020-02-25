const t = require('io-ts');
const fc = require('fast-check');
const { isLeft } = require('fp-ts/lib/Either');
const _ = require('lodash');
const moment = require('moment');
const { IsoDateTimeString, nonEmptyArray: nonEmptyArrayBrand } = require('./ioTsBrands');

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
 * @returns {import('./types').ObjectSpeck<TUnderlyingType>}
 */
function createObjectSpeck(ioTsType, fastCheckArbitrary) {
  return {
    _ioTsType: ioTsType,
    _fastCheckArbitrary: fastCheckArbitrary,
    _isObjectType: true,
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
 * You could use this for a price, for example
 *
 * - TypeScript: number
 * - Runtime Validation: is it a number? (TODO: also test that it is positive)
 * - Generation: Random positive floating point number
 *
 * TODO: Make max digit (for generation) a parameter rather than fixed at 100
 */
const positiveFloat = createNonObjectSpeck(t.number, fc.float(0, 100));

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
 * Positive integer
 *
 * - TypeScript: number
 * - Runtime validation: is it an integer? (TODO: also test that it is positive)
 * - Generation: Random positive integer
 *
 * TODO: Make max digit (for generation) a parameter rather than fixed at 100
 */
const positiveInt = createNonObjectSpeck(t.Int, fc.integer(0, 100));

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
 * Enum of string literals
 * TODO Typescript type of return object is too vague (returns string instead of 'abc' for example).
 *
 * @template {string} TString
 * @template {[TString, TString, ...TString[]]} TStrings 
 *
 * @param {TStrings} stringLiteralsArray 
 */
function literalEnum(stringLiteralsArray) {
  const literalA = t.literal(stringLiteralsArray[0]);
  const literalB = t.literal(stringLiteralsArray[1]);
  const literalsRest = stringLiteralsArray.slice(2).map(l => t.literal(l));
  const ioTsType = t.union([literalA, literalB, ...literalsRest]);
  
  const fastCheckArbitrary = fc.oneof(...(stringLiteralsArray.map(l => fc.constant(l))));
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

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
 * @returns {{
 *   ioTsTypes: {
 *     [K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_ioTsType']
 *   },
 *   fastCheckArbitraries: {
 *     [K in keyof TRecordOfSpecks]: TRecordOfSpecks[K]['_fastCheckArbitrary']
 *   }
 * }}
 */
function getIoTsTypesAndFastCheckArbitraries(recordOfSpecks) {
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
    ioTsTypes[key] = recordOfSpecks[key]._ioTsType;
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
 * @template {import('./types')._BaseRecordOfSpecks} TRecordOfSpecks
 * @param {TRecordOfSpecks} recordOfSpecks
 * @returns {import('./types').PartialType<TRecordOfSpecks>}
 */
function partial(recordOfSpecks) {
  const { ioTsTypes, fastCheckArbitraries } = getIoTsTypesAndFastCheckArbitraries(recordOfSpecks);
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
  return createObjectSpeck(ioTsType, fastCheckArbitrary);
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
   * @param {import('io-ts').Errors} ioTsErrors
   */
  constructor(ioTsErrors) {
    super('SpeckValidationErrors');
    this.errors = ioTsErrors;
  }
}

/**
 * @template TUnderlyingType
 * @param {import('./types').Speck<TUnderlyingType>} speck
 * @param {unknown} item
 * @return {TUnderlyingType | SpeckValidationErrors}
 */
function validate(speck, item) {
  /**
   * Due to Typescript's inherent strict nature, all io-ts object types are made strict here.
   * This means any excessive fields are stripped during the decode().
   * For a completely optional (partial) object, the decode could return an empty object if there are only excessive
   * fields in the pre-decoded object.
   */
  const validationResult = speck._isObjectType
    ? t.exact(/** @type {import('io-ts').HasProps} */ (speck._ioTsType)).decode(item)
    : speck._ioTsType.decode(item);

  if (isLeft(validationResult)) {
    return new SpeckValidationErrors(validationResult.left);
  }
  return speck._ioTsType.encode(validationResult.right);
}

module.exports = {
  // Simple types
  literal,
  string,
  urlString,
  emailString,
  isoDateTimeString,
  float,
  positiveFloat,
  int,
  positiveInt,
  boolean,
  // Higher order types
  array,
  nonEmptyArray,
  literalEnum,
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
};
