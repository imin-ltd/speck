/** Custom [io-ts Branded types](https://github.com/gcanti/io-ts#branded-types--refinements) */
const t = require('io-ts');

/** @typedef {import('./types').IsoDateTimeStringBrand} IsoDateTimeStringBrand */
/** @typedef {import('io-ts').Mixed} Mixed */

/**
 * Matches an ISO-8601 Datetime with seconds precision and a timezone designator
 * e.g. it will match:
 * 
 * - 2001-01-01T01:23:45Z
 * - 2001-01-01T01:23:45+01:00
 * 
 * but not:
 * 
 * - 2001-01-01T01:23:45 (no timezone designator)
 * - hiimnotadate (well it's not a datetime)
 */
const ISO_DATETIME_STRING_REGEX = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/;

const IsoDateTimeString = t.brand(
  t.string,
  /**
   * @param {string} string
   * @returns {string is t.Branded<string, IsoDateTimeStringBrand>}
   */
  (string) => {
    return ISO_DATETIME_STRING_REGEX.test(string);
  },
  'IsoDateTimeString');

/**
 * @template {Mixed} TIoTsType
 * @param {TIoTsType} type 
 */
  const nonEmptyArray = (type) => t.brand(
    t.array(type),
    /**
     * @param {import('io-ts').TypeOf<TIoTsType>[]} array
     * @returns {array is t.Branded<import('io-ts').TypeOf<TIoTsType>[], import('./types').NonEmptyArrayBrand<import('io-ts').TypeOf<TIoTsType>>>}
     */
  (array) => {
    return array.length >= 1;
  },
  `NonEmptyArray`
)

module.exports = {
  IsoDateTimeString,
  nonEmptyArray,
};
