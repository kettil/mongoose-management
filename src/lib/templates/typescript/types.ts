/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

namespace Virtual {
  /**
   * Helpers
   */
  type Keys<T> = { [K in keyof T]: T[K] extends never ? never : K }[keyof T];
  type Diff<T, U> = T extends U ? never : T;

  /**
   * Extracts the type from the function
   */
  type functionTypeGet<T extends { [k: string]: any }> = T['get'] extends Function ? ReturnType<T['get']> : never;
  type functionTypeSet<T extends { [k: string]: any }> = T['set'] extends (value: infer A) => void ? A : never;

  /**
   * List of all types (with the type "never")
   */
  type functionTypeGetList<T> = { [K in keyof T]: functionTypeGet<T[K]> };
  type functionTypeSetList<T> = { [K in keyof T]: functionTypeSet<T[K]> };

  /**
   * List of all types (without the type "never")
   */
  type typeGetList<T> = Pick<functionTypeGetList<T>, Keys<functionTypeGetList<T>>>;
  type typeSetList<T> = Pick<functionTypeSetList<T>, Keys<functionTypeSetList<T>>>;

  /**
   * List of Keys where the object have only "get"
   */
  type keysGetOnly<T> = Diff<keyof typeGetList<T>, keyof typeSetList<T>>;

  /**
   * List of Keys where without "get only" objects
   */
  type keysBoth<T> = Diff<keyof T, keysGetOnly<T>>;

  export type types<T> = { readonly [K in keyof typeGetList<T> & keysGetOnly<T>]: typeGetList<T>[K] } &
    { [K in keyof typeGetList<T> & keysBoth<T>]: typeGetList<T>[K] } &
    { [K in keyof typeSetList<T>]: typeSetList<T>[K] };
}

export type virtualType<T> = Virtual.types<T>;

export type extendTimestampType = {
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type extendIdType = {
  readonly _id: any;
  readonly id: any;
};
