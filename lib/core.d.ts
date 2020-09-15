import t = require('io-ts');
import fc from 'fast-check';
import { NonObjectSpeck, ObjectSpeck } from './types';
export declare function createNonObjectSpeck<TUnderlyingType, TIoTsStaticType>(ioTsType: t.Type<TIoTsStaticType, TUnderlyingType>, fastCheckArbitrary: fc.Arbitrary<TUnderlyingType>): NonObjectSpeck<TUnderlyingType, TIoTsStaticType>;
export declare function createObjectSpeck<TUnderlyingType, TIoTsStaticType>(ioTsType: t.Type<TIoTsStaticType, TUnderlyingType>, fastCheckArbitrary: fc.Arbitrary<TUnderlyingType>, allowsUnknown?: boolean): ObjectSpeck<TUnderlyingType, TIoTsStaticType>;
export declare function literal<TLiteralValue extends string | number | boolean>(value: TLiteralValue): NonObjectSpeck<TLiteralValue, TLiteralValue>;
