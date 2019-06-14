import fs from 'fs';
import { promisify } from 'util';

const access = promisify(fs.access);

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

export const copy = promisify(fs.copyFile);
export const mkdir = promisify(fs.mkdir);

export const exists = (path: string) => access(path, fs.constants.F_OK);
export const writable = (path: string) => access(path, fs.constants.W_OK);
