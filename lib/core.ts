import t = require('io-ts');
import fc from 'fast-check';
import { NonObjectSpeck, ObjectSpeck } from './types';

export function createNonObjectSpeck<TUnderlyingType, TIoTsStaticType>(
  ioTsType: t.Type<TIoTsStaticType, TUnderlyingType>,
  fastCheckArbitrary: fc.Arbitrary<TUnderlyingType>,
): NonObjectSpeck<TUnderlyingType, TIoTsStaticType> {
  return {
    _ioTsType: ioTsType,
    _fastCheckArbitrary: fastCheckArbitrary,
    _isObjectType: false,
  };
}

export function createObjectSpeck<TUnderlyingType, TIoTsStaticType>(
  ioTsType: t.Type<TIoTsStaticType, TUnderlyingType>,
  fastCheckArbitrary: fc.Arbitrary<TUnderlyingType>,
  allowsUnknown: boolean = false
): ObjectSpeck<TUnderlyingType, TIoTsStaticType> {
  return {
    _ioTsType: ioTsType,
    _fastCheckArbitrary: fastCheckArbitrary,
    _isObjectType: true,
    _allowsUnknown: allowsUnknown,
  };
}

export function literal<TLiteralValue extends string | number | boolean>(value: TLiteralValue) {
  return createNonObjectSpeck(t.literal(value), fc.constant(value));
}
