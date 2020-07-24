/*
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Document, DocumentQuery, Model, Aggregate } from 'mongoose';
import { PagesTypes } from '../documents/pages';
import { methods, queries, statics, virtuals } from '../repositories/pages';
import { ExtendIdType, ExtendTimestampType, VirtualType as VirtualTypeConvert, HooksHandler } from '../types';

type MethodsType = typeof methods;
type StaticsType = typeof statics;
type QueriesType = typeof queries;
type VirtualsType = VirtualTypeConvert<typeof virtuals>;

export type PagesDocument = PagesTypes & ExtendTimestampType & VirtualsType & MethodsType & Document;

export type PagesDocumentQuery = DocumentQuery<PagesDocument | PagesDocument[], PagesDocument>;

export type PagesModel = StaticsType & Model<PagesDocument, QueriesType>;

export type PagesVirtual = PagesTypes & ExtendTimestampType & ExtendIdType;

export type PagesHooks<ExtendQuery extends Record<string, unknown>> = HooksHandler<
  PagesDocument,
  PagesDocumentQuery,
  Aggregate<PagesDocument>,
  PagesModel,
  ExtendQuery
>;
