const t = require('io-ts');

const ioTsJsDate = new t.Type(
  'JSDate',
  /** @type {(input: unknown) => input is Date} */(input => input instanceof Date),
  (input, context) => input instanceof Date ? t.success(input) : t.failure(input, context),
  t.identity,
);

module.exports = {
  ioTsJsDate,
};
