export type IsoDateTimeStringBrand = import('./types').IsoDateTimeStringBrand;
export type Mixed = import('io-ts').Mixed;
export const IsoDateTimeString: t.BrandC<t.StringC, import("./types").IsoDateTimeStringBrand>;
/**
 * @template {Mixed} TIoTsType
 * @param {TIoTsType} type
 */
export function nonEmptyArray<TIoTsType extends t.Mixed>(type: TIoTsType): t.BrandC<t.ArrayC<TIoTsType>, import("./types").NonEmptyArrayBrand<t.TypeOf<TIoTsType>>>;
import t = require("io-ts");
