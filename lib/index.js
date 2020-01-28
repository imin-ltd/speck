const t = require('io-ts');
const fc = require('fast-check');
const { isLeft } = require('fp-ts/lib/Either');
const _ = require('lodash');
const { IsoDateTimeString } = require('./ioTsBrands');

/**
 * @typedef {import('./types')._BaseRecordOfSpecks} _BaseRecordOfSpecks
 */

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
  }).map(d => d.toISOString()));

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
 * Boolean
 *
 * - TypeScript: boolean
 * - Runtime validation: is it an boolean?
 * - Generation: Random boolean
 *
 */
const boolean = createNonObjectSpeck(t.boolean, fc.boolean());

/**
 * Used to get a record of io-ts types and a record of fast-check Arbitraries
 * from a record of Specks
 *
 * @template {_BaseRecordOfSpecks} TRecordOfSpecks
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
 * @template {_BaseRecordOfSpecks} TRecordOfSpecks
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
 * @template {_BaseRecordOfSpecks} TRecordOfSpecks
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
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types)
 *g
 * Example:
 * 
 * ```js
 * > var s = require('./lib')
 * > var HiOrBye = s.union([s.literal('hi'), s.literal('bye')])
 * > s.gen(HiOrBye)
 * 'bye'
 * > s.gen(HiOrBye)
 * 'hi'
 * > s.gen(HiOrBye)
 * 'hi'
 * > s.validate(HiOrBye, 'hii')
 * { Error: SpeckValidationErrors
 *     at Object.validate (/Volumes/IMIN VHD/Dev/speck/lib/index.js:360:12)
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
 *    [ { value: 'hii', context: [Array], message: undefined },
 *      { value: 'hii', context: [Array], message: undefined } ] }
 * > s.validate(HiOrBye, 'hi')
 * 'hi'
 * > s.validate(HiOrBye, 'bye')
 * 'bye'
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
  if (speckA._isObjectType && speckB._isObjectType) {
    // TODO not have to cast. If I do not use this case, TS gives error:
    // > Type 'ObjectSpeck<any, any>' is not assignable to type 'UnionType<[TA, TB]>'
    // No more detail than that..
    return /** @type {import('./types').UnionType<[TA, TB]>} */(createObjectSpeck(ioTsType, fastCheckArbitrary));
  } else {
    // TODO not have to cast. If I do not use this case, TS gives error:
    // > Type 'NonObjectSpeck<any, any>' is not assignable to type 'UnionType<[TA, TB]>'
    // No more detail than that..
    return /** @type {import('./types').UnionType<[TA, TB]>} */(createNonObjectSpeck(ioTsType, fastCheckArbitrary));
  }
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
 * @template {_BaseRecordOfSpecks} TRecordOfSpecks
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
  const validationResult = speck._ioTsType.decode(item);
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
  type,
  partial,
  intersection,
  union,
  pickRequireds,
  // API functions
  gen,
  SpeckValidationErrors,
  validate,
};
