import { regexpName, regexpNameMessage } from '../../prompts';

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
   * @param items
   * @param defaultValue
   */
  questions(items: string[], defaultValue?: string): ReadonlyArray<any> {
    return [
      {
        type: 'input',
        name: 'name',
        default: defaultValue,
        message: 'Collection name:',

        validate: (value: string) => {
          const item = value.trim();

          if (!regexpName.test(item)) {
            return regexpNameMessage;
          }

          if (items.indexOf(item.toLowerCase()) >= 0) {
            return `A collection with the name already exists!`;
          }

          return true;
        },
      },
    ];
  }

  /**
   *
   * @param items
   */
  async remove(items: dataCollectionType[]): Promise<string[] | false> {
    if (items.length === 0) {
      return false;
    }

    const choices: ReadonlyArray<any> = [
      {
        type: 'checkbox',
        name: 'collections',
        message: 'Which collections should be deleted?',
        choices: items.map((c) => c.name),
        // Show only if at least two collections have been passed.
        when: items.length > 1,
      },
      {
        type: 'confirm',
        name: 'isConfirm',
        message: 'Are the collection(s) really to be deleted?',
        default: false,

        // Show only if at least one collection is selected or only one collection is passed.
        when: ({ collections: c }: { collections: string[] }) =>
          (Array.isArray(c) && c.length > 0) || items.length === 1,
      },
    ];

    const { collections, isConfirm } = await this.prompts.call<{ collections: string[]; isConfirm: boolean }>(choices);

    if (items.length === 1 && isConfirm) {
      // single collection
      return items.map((v) => v.name);
    }

    if (Array.isArray(collections) && collections.length > 0 && isConfirm === true) {
      // multiple collections
      return collections;
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
