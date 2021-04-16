/**
 * Custom io-ts types. See how to create new io-ts types here:
 * https://github.com/gcanti/io-ts/blob/master/index.md#the-idea.
 */
import * as t from 'io-ts';

export const ioTsJsDate = new t.Type(
  'JSDate',
  (input: unknown): input is Date => input instanceof Date,
  (input, context) => input instanceof Date ? t.success(input) : t.failure(input, context),
  t.identity,
);
