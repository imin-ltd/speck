import t = require('io-ts');
import fc from 'fast-check';
import { Speck, NonObjectSpeck, TypeOf } from './types';
import { createNonObjectSpeck, literal } from './core';

// // union for 2 args
// export function U<TA extends Speck<any>, TB extends Speck<any>>(
//   specks: [TA, TB]
// ): NonObjectSpeck<TypeOf<TA> | TypeOf<TB>> {
//   const ioTsType = t.union([specks[0]._ioTsType, specks[1]._ioTsType]);
//   const fastCheckArbitrary = fc.oneof(specks[0]._fastCheckArbitrary, specks[1]._fastCheckArbitrary);
//   return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
// }

// union for 3 args
export function U<TA extends Speck<any>, TB extends Speck<any>>(
  specks: [TA, TB],
): NonObjectSpeck<TypeOf<TA> | TypeOf<TB>>
export function U<TA extends Speck<any>, TB extends Speck<any>, TC extends Speck<any>>(
  specks: [TA, TB, TC],
): NonObjectSpeck<TypeOf<TA> | TypeOf<TB> | TypeOf<TC>> {
  const ioTsType = t.union([specks[0]._ioTsType, specks[1]._ioTsType, specks[2]._ioTsType]);
  const fastCheckArbitrary = fc.oneof(specks[0]._fastCheckArbitrary, specks[1]._fastCheckArbitrary, specks[2]._fastCheckArbitrary);
  return createNonObjectSpeck(ioTsType, fastCheckArbitrary);
}

const abc = U([literal('a'), literal('b'), literal('c')]);
