export type IsoDateTimeStringBrand = import("./types").IsoDateTimeStringBrand;
export type Mixed = import("io-ts").Mixed;
export const IsoDateTimeString: import("io-ts").BrandC<import("io-ts").StringC, import("./types").IsoDateTimeStringBrand>;
/**
 * @template {Mixed} TIoTsType
 * @param {TIoTsType} type
 */
export function nonEmptyArray<TIoTsType extends import("io-ts").Mixed>(type: TIoTsType): import("io-ts").BrandC<import("io-ts").ArrayC<TIoTsType>, import("./types").NonEmptyArrayBrand<import("io-ts").TypeOf<TIoTsType>>>;
