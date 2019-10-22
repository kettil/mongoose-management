/**
 * This function converts old data structure into the new structure.
 */

import { dataColumnType, dataIndexType, dataType } from './types';

type subType = {
  type: string;
  subType?: subType;
};

export const converterSubType = (column: subType): string[] => {
  if (column.subType) {
    return [column.type, ...converterSubType(column.subType)];
  }

  return [column.type];
};

export const recursionSubType = (column: dataColumnType) => {
  if (column.type === 'arrayType' && (column as any).subType) {
    column.subTypes = converterSubType((column as any).subType) as any;
    delete (column as any).subType;
  }

  if (column.subColumns) {
    column.subColumns.forEach(recursionSubType);
  }
};

export const convertColumnIndex = (index: dataIndexType) => {
  if (typeof (index as any).mode !== 'undefined' && typeof (index as any).type !== 'undefined') {
    index.name = index.name.replace(`-${(index as any).mode}_`, '_');
    delete (index as any).mode;
    delete (index as any).type;
  }
};

export const converter = (data: dataType) => {
  data.groups.forEach((v1) =>
    v1.collections.forEach((v2) => {
      v2.columns.forEach(recursionSubType);

      v2.indexes.forEach(convertColumnIndex);
    }),
  );
};

export default converter;
