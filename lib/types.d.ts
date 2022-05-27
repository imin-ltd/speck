import * as t from 'io-ts';
import * as fc from 'fast-check';
/** # Base Speck types */
/**
 * @template TUnderlyingType The TypeScript type of this specification.
 * @template TIoTsStaticType An internal type that is used by io-ts. This only
 *   differs from TUnderlyingType for io-ts "branded" types (https://github.com/gcanti/io-ts#branded-types--refinements).
 */
export declare type BaseSpeck<TUnderlyingType, TIoTsStaticType = TUnderlyingType> = {
    readonly _ioTsType: t.Type<TIoTsStaticType, TUnderlyingType>;
    readonly _fastCheckArbitrary: fc.Arbitrary<TUnderlyingType>;
};
/**
 * _TODO Docs to come_
 */
export declare type NonObjectSpeck<TUnderlyingType, TIoTsStaticType = TUnderlyingType> = BaseSpeck<TUnderlyingType, TIoTsStaticType> & {
    readonly _isObjectType: false;
};
/**
 * Object specks are special because they can be combined with
 * `s.intersection()`
 */
export declare type ObjectSpeck<TUnderlyingType, TIoTsStaticType = TUnderlyingType> = BaseSpeck<TUnderlyingType, TIoTsStaticType> & {
    readonly _isObjectType: true;
    /**
     * If true, this object allows unknown fields.
     * If false, this object only strictly allows from a finite set of fields.
     * For more info, see validate()
     */
    readonly _allowsUnknown: boolean;
};
export declare type Speck<TUnderlyingType, TIoTsStaticType = TUnderlyingType> = NonObjectSpeck<TUnderlyingType, TIoTsStaticType> | ObjectSpeck<TUnderlyingType, TIoTsStaticType>;
/** # API */
/**
 * Get the TypeScript type of an Speck object
 */
export declare type TypeOf<T extends Speck<any>> = t.OutputOf<T['_ioTsType']>;
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
export declare type _BaseRecordOfSpecks = Record<string, Speck<any>>;
export declare type ArrayType<TSpeck extends Speck<any>> = NonObjectSpeck<TypeOf<TSpeck>[]>;
export declare type NonEmptyBrandedArrayType<TSpeck extends Speck<any>> = NonObjectSpeck<TypeOf<TSpeck>[], t.Branded<TypeOf<TSpeck>[], NonEmptyArrayBrand<TypeOf<TSpeck>>>>;
export declare type RecordType<TKeySpeck extends NonObjectSpeck<string>, TValueSpeck extends Speck<any>> = ObjectSpeck<Record<TypeOf<TKeySpeck>, TypeOf<TValueSpeck>>>;
/**
 * The name is strange but it is consistent with the naming scheme. This is
 * the TypeScript "type" of values returned by the "type" function.
 */
export declare type TypeType<TRecordOfSpecks extends _BaseRecordOfSpecks> = ObjectSpeck<{
    [K in keyof TRecordOfSpecks]: TypeOf<TRecordOfSpecks[K]>;
}>;
export declare type PartialType<TRecordOfSpecks extends _BaseRecordOfSpecks> = ObjectSpeck<{
    [K in keyof TRecordOfSpecks]?: TypeOf<TRecordOfSpecks[K]> | null | undefined;
}>;
export declare type IntersectionType<TObjectSpecks extends [ObjectSpeck<any>, ObjectSpeck<any>]> = ObjectSpeck<TypeOf<TObjectSpecks[0]> & TypeOf<TObjectSpecks[1]>>;
export declare type UnionObjectsType<TObjectSpecks extends [ObjectSpeck<any>, ObjectSpeck<any>]> = ObjectSpeck<TypeOf<TObjectSpecks[0]> | TypeOf<TObjectSpecks[1]>>;
export declare type UnionType<TSpecks extends [Speck<any>, Speck<any>]> = NonObjectSpeck<TypeOf<TSpecks[0]> | TypeOf<TSpecks[1]>>;
export interface IsoDateTimeStringBrand {
    readonly IsoDateTimeString: unique symbol;
}
export interface NonEmptyArrayBrand<T> {
    readonly 'NonEmptyArray': unique symbol;
}
