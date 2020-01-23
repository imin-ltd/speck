# speck

A speck is a specification that can be used for:

1. TypeScript type checking
2. Run-time validation
3. Generation of random test data

Under the hood it uses:

- [io-ts](https://github.com/gcanti/io-ts): Combines TypeScript types with Run-time validation. VERY IMPORTANT
- [fast-check](https://github.com/dubzzz/fast-check): Generative testing framework.

It copies some code from:

- [fast-check-io-ts](https://github.com/giogonzo/fast-check-io-ts): Marries `io-ts` with `fast-check`. `fast-check-io-ts` and `speck` have the same aim. Speck just adds the ability to define custom specifications e.g. an email specification which generates and validates emails and has TypeScript type `string`.

It is inspired by:

- [Clojure spec](https://clojure.org/guides/spec).

🐵

## Example

An example node REPL session which demonstrates runtime validation and generation of test data.

First, set-up:

```js
> const s = require('@imin/speck');

> const Offer = s.intersection([
  s.type({
    type: s.literal('Offer'),
  }),
  s.partial({
    id: s.urlString,
    name: s.string,
    price: s.positiveFloat,
    priceCurrency: s.literal('GBP'),
  }),
]);
```

Runtime validation:

```js
> s.validate(Offer, {
  type: 'Offer',
  price: 3.4,
  priceCurrency: 'GBP',
});
{ type: 'Offer', price: 3.4, priceCurrency: 'GBP' } // i.e. this is valid
> s.validate(Offer, {
  type: 'Offer',
  price: 'not a number',
});
{ Error: SpeckValidationErrors
  // .. stack trace
  errors:
   [ { value: 'not a number', context: [Array] }] } // i.e. there's a validation error. It is explained in detail in the context
```

Generation of random test data

```js
> s.gen(Offer, {
  name: 'Offer #1',
});

{ type: 'Offer',
  id:
   'http://ebueegdadw.xnewckh2f3-y.unztjlyc/%F4%8D%86%A0An:%F2%AE%A7%84/2/,/dAy_q/Fs%F1%99%B0%A8Kn/S*muw%F4%8D%AE%88*Ny/_n%F1%89%AE%A2W',
  name: 'Offer #1',
  price: 39.99195694923401 }
```

## TODOs

- Document more thoroughly
- Unit tests
