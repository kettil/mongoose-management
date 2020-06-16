import uuidHelpers from './uuidHelpers';

describe('Check the uuidHelpers class', () => {
  test.each([
    {
      output: [0x11, 0xf5, 0xe7, 0x3a, 0x4c, 0x2d, 0x4c, 0x5c, 0xa2, 0xd9, 0xa0, 0xaf, 0x62, 0xc7, 0x90, 0x4d],
      input: '11f5e73a-4c2d-4c5c-a2d9-a0af62c7904d',
    },
    {
      output: [0x11, 0xf5, 0xe7, 0x3a, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
      input: '11f5e73a',
    },
    {
      output: [0x11, 0xf5, 0xe7, 0x3a, 0x4c, 0x2d, 0x4c, 0x5c, 0xa2, 0xd9, 0xa0, 0xaf, 0x62, 0xc7, 0x90, 0x4d],
      input: '11f5e73a-4c2d-4c5c-a2d9-a0af62c7904d-111111',
    },
  ])('parse should correctly convert uuid strings to their binary value', ({ input, output }) => {
    expect(uuidHelpers.parse(input)).toEqual(output);
  });

  test.each([
    {
      output: Buffer.from([
        0x11,
        0xf5,
        0xe7,
        0x3a,
        0x4c,
        0x2d,
        0x4c,
        0x5c,
        0xa2,
        0xd9,
        0xa0,
        0xaf,
        0x62,
        0xc7,
        0x90,
        0x4d,
      ]),
      input: '11f5e73a-4c2d-4c5c-a2d9-a0af62c7904d',
    },
    {
      output: Buffer.from([0x11, 0xf5, 0xe7, 0x3a, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
      input: '11f5e73a',
    },
    {
      output: Buffer.from([
        0x11,
        0xf5,
        0xe7,
        0x3a,
        0x4c,
        0x2d,
        0x4c,
        0x5c,
        0xa2,
        0xd9,
        0xa0,
        0xaf,
        0x62,
        0xc7,
        0x90,
        0x4d,
      ]),
      input: '11f5e73a-4c2d-4c5c-a2d9-a0af62c7904d-111111',
    },
    {
      output: Buffer.from([
        0x11,
        0xf5,
        0xe7,
        0x3a,
        0x4c,
        0x2d,
        0x4c,
        0x5c,
        0xa2,
        0xd9,
        0xa0,
        0xaf,
        0x62,
        0xc7,
        0x90,
        0x4d,
      ]),
      input: Buffer.from([
        0x11,
        0xf5,
        0xe7,
        0x3a,
        0x4c,
        0x2d,
        0x4c,
        0x5c,
        0xa2,
        0xd9,
        0xa0,
        0xaf,
        0x62,
        0xc7,
        0x90,
        0x4d,
      ]),
    },
  ])('setter should correctly convert uuid strings to their binary value', ({ input, output }) => {
    expect(uuidHelpers.setter(input)).toEqual(output);
  });

  test('setter should throw if you pass invalid values', () => {
    expect(() => {
      uuidHelpers.setter(undefined);
    }).toThrow('Could not convert');
  });

  test.each([
    {
      input: Buffer.from([
        0x11,
        0xf5,
        0xe7,
        0x3a,
        0x4c,
        0x2d,
        0x4c,
        0x5c,
        0xa2,
        0xd9,
        0xa0,
        0xaf,
        0x62,
        0xc7,
        0x90,
        0x4d,
      ]),
      output: '11f5e73a-4c2d-4c5c-a2d9-a0af62c7904d',
    },
    {
      input: Buffer.from([0x11, 0xf5, 0xe7, 0x3a, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
      output: '11f5e73a-0000-0000-0000-000000000000',
    },
    {
      input: Buffer.from([
        0x11,
        0xf5,
        0xe7,
        0x3a,
        0x4c,
        0x2d,
        0x4c,
        0x5c,
        0xa2,
        0xd9,
        0xa0,
        0xaf,
        0x62,
        0xc7,
        0x90,
        0x4d,
        0x11,
        0x11,
        0x11,
        0x11,
        0x11,
      ]),
      output: '11f5e73a-4c2d-4c5c-a2d9-a0af62c7904d',
    },
  ])('unparse should correctly convert uuid buffers to their string value', ({ input, output }) => {
    expect(uuidHelpers.unparse(input)).toEqual(output);
  });

  test.each([
    {
      input: Buffer.from([
        0x11,
        0xf5,
        0xe7,
        0x3a,
        0x4c,
        0x2d,
        0x4c,
        0x5c,
        0xa2,
        0xd9,
        0xa0,
        0xaf,
        0x62,
        0xc7,
        0x90,
        0x4d,
      ]),
      output: '11f5e73a-4c2d-4c5c-a2d9-a0af62c7904d',
    },
    {
      input: Buffer.from([0x11, 0xf5, 0xe7, 0x3a, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
      output: '11f5e73a-0000-0000-0000-000000000000',
    },
    {
      input: Buffer.from([
        0x11,
        0xf5,
        0xe7,
        0x3a,
        0x4c,
        0x2d,
        0x4c,
        0x5c,
        0xa2,
        0xd9,
        0xa0,
        0xaf,
        0x62,
        0xc7,
        0x90,
        0x4d,
        0x11,
        0x11,
        0x11,
        0x11,
        0x11,
      ]),
      output: '11f5e73a-4c2d-4c5c-a2d9-a0af62c7904d',
    },
    {
      input: undefined,
      output: undefined,
    },
  ])('getter should correctly convert uuid buffers to their string value', ({ input, output }) => {
    expect(uuidHelpers.getter(input)).toEqual(output);
  });
});
