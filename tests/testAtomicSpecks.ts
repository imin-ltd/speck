import { expect } from 'chai';
import { isNil } from 'lodash';
import * as s from '../lib';

describe('testAtomicSpecks', () => {
  describe('s.literal', () => {
    itTestAtomicSpeck({
      speckName: 'literal',
      speck: s.literal('kthfglr'),
      assertIsCorrectTypeFn: assertIsChaiType('string'),
      validValue: 'kthfglr',
      invalidValue: 'kthfglo',
    });
  });
  describe('s.float', () => {
    itTestAtomicSpeck({
      speckName: 'float',
      speck: s.float,
      assertIsCorrectTypeFn: assertIsChaiType('number'),
      validValue: 29.1,
      invalidValue: new Error(),
    });
  });
  describe('s.int', () => {
    itTestAtomicSpeck({
      speckName: 'int',
      speck: s.int,
      assertIsCorrectTypeFn: assertIsChaiType('number'),
      validValue: 101,
      invalidValue: 101.01,
    });
  });
  describe('s.string', () => {
    itTestAtomicSpeck({
      speckName: 'string',
      speck: s.string,
      assertIsCorrectTypeFn: assertIsChaiType('string'),
      validValue: 'C:',
      invalidValue: 17,
    });
  });
  describe('s.boolean', () => {
    itTestAtomicSpeck({
      speckName: 'boolean',
      speck: s.boolean,
      assertIsCorrectTypeFn: assertIsChaiType('boolean'),
      validValue: false,
      invalidValue: 3,
    });
  });
  describe('s.jsDate', () => {
    itTestAtomicSpeck({
      speckName: 'jsDate',
      speck: s.jsDate,
      assertIsCorrectTypeFn: assertIsChaiType('Date'),
      validValue: new Date(),
      invalidValue: Symbol('im-not-a-date'),
    });
  });
  describe('s.nil', () => {
    itTestAtomicSpeck({
      speckName: 'nil',
      speck: s.nil,
      assertIsCorrectTypeFn: (chaiAssertion) => chaiAssertion.to.satisfy(isNil),
      validValue: null,
      invalidValue: 0,
    });
  });
});

function itTestAtomicSpeck({ speckName, speck, assertIsCorrectTypeFn, validValue, invalidValue }: {
  /** Used to label tests */
  speckName: string,
  speck: s.Speck<any>,
  assertIsCorrectTypeFn?: (chaiAssertion: Chai.Assertion) => void,
  /** Value that should be considered valid for this speck */
  validValue: unknown,
  /** Value that should be considered invalid for this speck */
  invalidValue: unknown,
}) {
  it(`should generate a ${speckName}`, () => {
    assertIsCorrectTypeFn(expect(s.gen(speck)));
  });
  it(`should validate a valid ${speckName}`, () => {
    expect(s.validate(speck, validValue)).to.equal(validValue);
  });
  it(`should invalidate an invalid ${speckName}`, () => {
    expect(s.validate(speck, invalidValue)).to.be.an.instanceof(s.SpeckValidationErrors);
  });
}

/**
 * @param chaiType Type as defined by chai's [type-detect](https://github.com/chaijs/type-detect) library
 * Either use this or isCorrectTypeFn
 */
function assertIsChaiType(chaiType: string) {
  return (chaiAssertion: Chai.Assertion) => chaiAssertion.to.be.a(chaiType);
}
