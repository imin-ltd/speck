/**
 * Custom [io-ts Branded types](https://github.com/gcanti/io-ts#branded-types--refinements)
 */
import * as t from 'io-ts';
import { IsoDateTimeStringBrand, NonEmptyArrayBrand } from './types';
export declare const IsoDateTimeString: t.BrandC<t.StringC, IsoDateTimeStringBrand>;
export declare const nonEmptyArray: <TIoTsType extends t.Mixed>(type: TIoTsType) => t.BrandC<t.ArrayC<TIoTsType>, NonEmptyArrayBrand<t.TypeOf<TIoTsType>>>;
