import * as t from 'io-ts';
import { IsoDateTimeStringBrand } from './types';

export const IsoDateTimeString: t.BrandC<t.StringC, IsoDateTimeStringBrand>;
