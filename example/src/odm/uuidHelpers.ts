/* eslint-disable import/no-unused-modules */
/*
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import * as BSON from 'bson';
import { v4 } from 'uuid';

const byteToHex: string[] = [];
const hexToByte: { [key: string]: number } = {};

const uuidRegex = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/;

for (let i = 0; i < 256; i += 1) {
  const value = 256 + i;

  const hex = value.toString(16).slice(1);

  byteToHex[i] = hex;
  hexToByte[hex] = i;
}

const isUuid = (uuid: string): boolean => uuidRegex.test(uuid);

export const parse = (uuid: string): Buffer => {
  if (!isUuid(uuid)) {
    throw new Error(`The value has not the UUID format: ${uuid}`);
  }

  const uuidArray = uuid.split('-').reduce<number[]>((buf, uuidPart) => {
    for (let i = 0; i < uuidPart.length; i += 2) {
      buf.push(hexToByte[uuidPart.slice(i, i + 2)]);
    }

    return buf;
  }, []);

  return Buffer.from(uuidArray);
};

export const unparse = (value: unknown): string => {
  if (typeof value === 'string' && isUuid(value)) {
    return value;
  }

  if (Buffer.isBuffer(value) && value.length === 16) {
    let hex = '';

    for (let i = 0; i < 16; i += 1) {
      const n = value.readUInt8(i);
      const h = byteToHex[n];

      hex += h;
    }

    const part1 = hex.slice(0, 8);
    const part2 = hex.slice(8, 12);
    const part3 = hex.slice(12, 16);
    const part4 = hex.slice(16, 20);
    const part5 = hex.slice(20, 32);
    const uuid = `${part1}-${part2}-${part3}-${part4}-${part5}`;

    return uuid;
  }

  throw new Error('The buffer has not the UUID format');
};

export const uuidGetter = (value: unknown): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return unparse(value);
};

export const uuidSetter = (value: string | Buffer): Buffer => {
  if (Buffer.isBuffer(value)) {
    // Checks whether the data in the buffer is a valid UUID
    unparse(value);

    return value;
  }

  if (typeof value === 'string') {
    return Buffer.from(parse(value));
  }

  throw new Error(`Could not convert ${value} to UUID`);
};

export const bson = BSON;
export const uuidv4 = v4;
