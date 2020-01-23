import * as t from 'io-ts';
import {
  _BaseRecordOfSpecks,
  ArrayType,
  IntersectionType,
  IsoDateTimeStringBrand,
  NonObjectSpeck,
  ObjectSpeck,
  PartialType,
  Speck,
  TypeType,
} from './types';

/**
 * Literal type. An item with this type can only have one exact value.
 *
 * - TypeScript: Literal
 * - Runtime Validation: is it this exact literal?
 * - Generation: the literal value
 */
export function literal<TLiteralValue extends string>(value: TLiteralValue): Speck<TLiteralValue>;

/**
 * - TypeScript: string
 * - Runtime Validation: is it a string?
 * - Generation: random string
 */
export const string: NonObjectSpeck<string>;

/**
 * - TypeScript: string
 * - Runtime Validation: is it a string? (TODO: also test that it is a URL)
 * - Generation: random URL
 */
export const urlString: NonObjectSpeck<string>;

/**
 * ISO-8601 Date time string e.g. 2001-01-01T01:23:45Z. Has seconds precision
 * and a timezone designator
 *
 * - TypeScript: string
 * - Runtime validation: is it an ISO-8601 datetime?
 * - Generation: Random ISO-8601 datetime string
 */
export const isoDateTimeString: NonObjectSpeck<string, t.Branded<string, IsoDateTimeStringBrand>>;

/**
 * You could use this for a price, for example
 *
 * - TypeScript: number
 * - Runtime Validation: is it a number? (TODO: also test that it is positive)
 * - Generation: Random positive floating point number
 *
 * TODO: Make max digit (for generation) a parameter rather than fixed at 100
 */
export const positiveFloat: NonObjectSpeck<number>;

/**
 * Positive integer
 *
 * - TypeScript: number
 * - Runtime validation: is it an integer? (TODO: also test that it is positive)
 * - Generation: Random positive integer
 *
 * TODO: Make max digit (for generation) a parameter rather than fixed at 100
 */
export const positiveInt: NonObjectSpeck<number, t.Branded<number, t.IntBrand>>;

/**
 * Array of specks
 */
export function array<TSpeck extends Speck<any>>(speck: TSpeck): ArrayType<TSpeck>;

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
export function type<TRecordOfSpecks extends _BaseRecordOfSpecks>(spec: TRecordOfSpecks): TypeType<TRecordOfSpecks>;

/**
 * A record of Specks that are optional e.g.
 * 
 * ```js
 * const PartialUrl = s.partial({
 *   type: s.literal('Url'),
 *   id: s.urlString,
 * });
 * ```
 */
export function partial<TRecordOfSpecks extends _BaseRecordOfSpecks>(spec: TRecordOfSpecks): PartialType<TRecordOfSpecks>;

/** _TODO document_ */
export function intersection<
  TA extends ObjectSpeck<any>,
  TB extends ObjectSpeck<any>
>(specks: [TA, TB]): IntersectionType<[TA, TB]>;

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
 */
export function gen<TUnderlyingType>(speck: Speck<TUnderlyingType>, overrides: Partial<TUnderlyingType> | null): TUnderlyingType;

export class SpeckValidationErrors extends Error {
  errors: t.Errors;
}

export function validate<TUnderlyingType>(speck: Speck<TUnderlyingType>, item: unknown): TUnderlyingType | SpeckValidationErrors;
