import * as t from 'io-ts';
import * as fc from 'fast-check';

/** # The King */

/**
 * @template TUnderlyingType The TypeScript type of this specification.
 * @template TIoTsStaticType An internal type that is used by io-ts. This only
 *   differs from TUnderlyingType for io-ts "branded" types (https://github.com/gcanti/io-ts#branded-types--refinements).
 */
export type BaseSpeck<TUnderlyingType, TIoTsStaticType = TUnderlyingType> = {
  readonly _ioTsType: t.Type<TIoTsStaticType, TUnderlyingType>;
  readonly _fastCheckArbitrary: fc.Arbitrary<TUnderlyingType>;
};

/**
 * _TODO Docs to come_
 */
export type NonObjectSpeck<TUnderlyingType, TIoTsStaticType = TUnderlyingType> =
  BaseSpeck<TUnderlyingType, TIoTsStaticType> & {
    readonly _isObjectType: false;
  };

/**
 * Object specks are special because they can be combined with
 * `s.intersection()`
 */
export type ObjectSpeck<TUnderlyingType, TIoTsStaticType = TUnderlyingType> =
  BaseSpeck<TUnderlyingType, TIoTsStaticType> & {
    readonly _isObjectType: true;
  };

export type Speck<TUnderlyingType, TIoTsStaticType = TUnderlyingType> =
  | NonObjectSpeck<TUnderlyingType, TIoTsStaticType>
  | ObjectSpeck<TUnderlyingType, TIoTsStaticType>;

/** # API */

/**
 * Get the TypeScript type of an Speck object
 */
export type TypeOf<T extends Speck<any>> = t.OutputOf<T['_ioTsType']>;

/** # Internal */

/**
 * Something for template parameters to extend.
 * A record whose keys are strings and values are Specks e.g.
 *
 * ```ts
 * const record: BaseRecordOfSpecks = {
 *   type: t.literal('Url'),
 *   id: t.urlString,
 * }
 * ```
 *
 * It is not recommended to use this type in anything but a template's
 * `extends` clause (hence "Base") as it uses `any`.
 */
export type _BaseRecordOfSpecks = Record<string, Speck<any>>;

export type LiteralType<TLiteralValue extends string> = NonObjectSpeck<TLiteralValue>;

export type ArrayType<TSpeck extends Speck<any>> = NonObjectSpeck<TypeOf<TSpeck>[]>;

/**
 * The name is strange but it is consistent with the naming scheme. This is
 * the TypeScript "type" of values returned by the "type" function.
 */
export type TypeType<TRecordOfSpecks extends _BaseRecordOfSpecks> = ObjectSpeck<{
  [K in keyof TRecordOfSpecks]: TypeOf<TRecordOfSpecks[K]>;
}>;

export type PartialType<TRecordOfSpecks extends _BaseRecordOfSpecks> = ObjectSpeck<{
  [K in keyof TRecordOfSpecks]?: TypeOf<TRecordOfSpecks[K]>;
}>;

export type RecordyType<TRecordOfSpecks extends _BaseRecordOfSpecks> =
  | TypeType<TRecordOfSpecks>
  | PartialType<TRecordOfSpecks>;

export type IntersectionType<TRecordyTypes extends [RecordyType<any>, RecordyType<any>]> =
  ObjectSpeck<TypeOf<TRecordyTypes[0]> & TypeOf<TRecordyTypes[1]>>;

// # io-ts Brand types

export interface IsoDateTimeStringBrand {
  readonly IsoDateTimeString: unique symbol;
}
