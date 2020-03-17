import { Types } from 'mongoose';
import bson from 'bson';

const byteToHex: string[] = [];
const hexToByte: { [key: string]: number } = {};

for (let i = 0; i < 256; i++) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
  hexToByte[byteToHex[i]] = i;
}

export const parse = (val: string): number[] => {
  let i = 0;
  const buf: number[] = [];

  val.toLowerCase().replace(/[0-9a-f]{2}/g, (oct: string) => {
    if (i < 16) {
      buf[i++] = hexToByte[oct];
    }

    return '';
  });

  while (i < 16) {
    buf[i++] = 0;
  }

  return buf;
};

export const unparse = (value: Buffer): string => {
  let hex = '';
  const len = value.length;
  const buf = new Buffer(len);
  for (let i = 0; i < len; i++) {
    buf[i] = value[i];
  }
  for (let i = 0; i < len; i++) {
    const n = buf.readUInt8(i);
    if (n < 16) {
      hex += '0' + n.toString(16);
    } else {
      hex += n.toString(16);
    }
  }

  return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`;
};

export const getter = (value: Buffer | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return unparse(value);
};

export const setter = (value: string | Buffer | any) => {
  if (value instanceof Buffer) {
    return value;
  }
  if (typeof value === 'string') {
    const uuidBuffer = new Types.Buffer(parse(value));
    uuidBuffer.subtype(bson.Binary.SUBTYPE_UUID);

    return uuidBuffer.toObject();
  }
  throw new Error(`Could not convert ${value} to UUID`);
};

export default {
  getter,
  setter,
  parse,
  unparse,
};
