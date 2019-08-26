import * as questions from '../questions';
import AbstractAction from './abstract';

import { choicesType, dataCollectionType } from '../../types';

/**
 *
 */
export default class CollectionAction extends AbstractAction<dataCollectionType> {
  /**
   *
   * @param groups
   */
  getMenuItems(groups: dataCollectionType[]): Array<choicesType<dataCollectionType>> {
    return groups.map((d) => ({ name: d.name, value: { value: d }, short: d.name }));
  }

  /**
   *
   */
  async create(collections: dataCollectionType[]): Promise<dataCollectionType | false> {
    const answersMain = await this.prompts.call<questions.collectionMainAnswersType>(
      questions.collectionMainQuestions(undefined, collections),
    );

    if (answersMain.name === '') {
      return false;
    }

    return questions.collectionMainEvaluation(undefined, answersMain);
  }

  /**
   *
   * @param colections
   * @param colection
   */
  async edit(collections: dataCollectionType[], collection: dataCollectionType): Promise<void> {
    const answersMain = await this.prompts.call<questions.collectionMainAnswersType>(
      questions.collectionMainQuestions(collection, collections),
    );

    if (answersMain.name === '') {
      return;
    }

    questions.collectionMainEvaluation(collection, answersMain);
  }

  /**
   *
   * @param collections
   */
  async remove(collections: dataCollectionType[]): Promise<string[] | false> {
    if (collections.length === 0) {
      return false;
    }

    const { collections: names, isConfirm } = await this.prompts.call<questions.collectionRemoveAnswersType>(
      questions.collectionRemoveQuestions(collections),
    );

    if (isConfirm && collections.length === 1) {
      // single collection
      return collections.map((v) => v.name);
    }

    if (isConfirm && Array.isArray(names) && names.length > 0) {
      // multiple collections
      return names;
    }

    return false;
  }

  /**
   *
   * @param a
   * @param b
   */
  sort(a: dataCollectionType, b: dataCollectionType) {
    const pathA = a.name.toLowerCase();
    const pathB = b.name.toLowerCase();

    if (pathA === pathB) {
      return 0;
    }

    return pathA < pathB ? -1 : 1;
  }
}
