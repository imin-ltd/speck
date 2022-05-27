import * as t from 'io-ts';
import * as fc from 'fast-check';

/** # Base Speck types */

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
    /**
     * If true, this object allows unknown fields.
     * If false, this object only strictly allows from a finite set of fields.
     * For more info, see validate()
     */
    readonly _allowsUnknown: boolean;
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

export type ArrayType<TSpeck extends Speck<any>> = NonObjectSpeck<TypeOf<TSpeck>[]>;

export type NonEmptyBrandedArrayType<TSpeck extends Speck<any>> = NonObjectSpeck<TypeOf<TSpeck>[], t.Branded<TypeOf<TSpeck>[], NonEmptyArrayBrand<TypeOf<TSpeck>>>>;

export type RecordType<TKeySpeck extends NonObjectSpeck<string>, TValueSpeck extends Speck<any>>
  = ObjectSpeck<Record<TypeOf<TKeySpeck>, TypeOf<TValueSpeck>>>;

/**
 * The name is strange but it is consistent with the naming scheme. This is
 * the TypeScript "type" of values returned by the "type" function.
 */
export type TypeType<TRecordOfSpecks extends _BaseRecordOfSpecks> = ObjectSpeck<{
  [K in keyof TRecordOfSpecks]: TypeOf<TRecordOfSpecks[K]>;
}>;

export type PartialType<TRecordOfSpecks extends _BaseRecordOfSpecks> = ObjectSpeck<{
  [K in keyof TRecordOfSpecks]?: TypeOf<TRecordOfSpecks[K]> | null | undefined;
}>;

export type IntersectionType<TObjectSpecks extends [ObjectSpeck<any>, ObjectSpeck<any>]> =
  ObjectSpeck<TypeOf<TObjectSpecks[0]> & TypeOf<TObjectSpecks[1]>>;

// A glimpse into what a better world could look like. Alas, I was not able to
// get this to work:
//
// ```ts
// export type UnionType<TSpecks extends [Speck<any>, Speck<any>]> =
//   TSpecks[0] extends ObjectSpeck<any>
//     ? (TSpecks[1] extends ObjectSpeck<any>
//       // iff both specks are ObjectSpecks, then the result will be an
//       // ObjectSpeck. Otherwise, the result will be a NonObjectSpeck.
//       //
//       // This is important as intersection() can only meaningfully work on
//       // ObjectSpecks (e.g. what's the intersection between `3` and
//       // `{ x: number }`? No value could satisfy that intersection, so it's
//       // meaningless).
//       //
//       // Therefore, by doing this, we ensure that intersection, which only
//       // accepts ObjectSpecks, will never be given specks that have any chance
//       // of not representing objects (e.g. this disallows
//       // `'hi' | { x: number }` from being given as an input to intersection()).
//       ? ObjectSpeck<TypeOf<TSpecks[0]> | TypeOf<TSpecks[1]>>
//       : NonObjectSpeck<TypeOf<TSpecks[0]> | TypeOf<TSpecks[1]>>)
//     : NonObjectSpeck<TypeOf<TSpecks[0]> | TypeOf<TSpecks[1]>>;
// ```

export type UnionObjectsType<TObjectSpecks extends [ObjectSpeck<any>, ObjectSpeck<any>]> =
  ObjectSpeck<TypeOf<TObjectSpecks[0]> | TypeOf<TObjectSpecks[1]>>;

export type UnionType<TSpecks extends [Speck<any>, Speck<any>]> =
  NonObjectSpeck<TypeOf<TSpecks[0]> | TypeOf<TSpecks[1]>>;

// # io-ts Brand types

export interface IsoDateTimeStringBrand {
  readonly IsoDateTimeString: unique symbol;
}

// export interface NonEmptyArrayBrand<T> extends Array<T> {
export interface NonEmptyArrayBrand<T>{
  readonly 'NonEmptyArray': unique symbol;
}