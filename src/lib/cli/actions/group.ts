import * as questions from '../questions';
import AbstractAction from './abstract';

import { choicesType, dataGroupType } from '../../types';

/**
 *
 */
export default class GroupAction extends AbstractAction<dataGroupType> {
  /**
   *
   * @param groups
   */
  getMenuItems(groups: dataGroupType[]): Array<choicesType<dataGroupType>> {
    return groups.map((d) => ({ name: d.path, value: { value: d }, short: d.path }));
  }

  /**
   *
   * @param items
   */
  async create(groups: dataGroupType[]): Promise<dataGroupType | false> {
    const answersMain = await this.prompts.call<questions.groupMainAnswersType>(questions.groupMainQuestions(groups));

    if (answersMain.name === '') {
      return false;
    }

    return questions.groupMainEvaluation(undefined, answersMain);
  }

  /**
   *
   * @param groups
   * @param group
   */
  async edit(): Promise<void> {
    // empty
  }

  /**
   *
   * @param items
   */
  async remove(items: dataGroupType[]): Promise<string[] | false> {
    if (items.length === 0) {
      return false;
    }

    const choices: ReadonlyArray<any> = [
      {
        type: 'checkbox',
        name: 'groups',
        message: 'Which groups should be deleted?',
        choices: items.map((c) => c.path),
      },
      {
        type: 'confirm',
        name: 'isConfirm',
        message: 'Are the group(s) really to be deleted? (The generated files are not deleted!)',
        default: false,

        when: ({ groups: g }: { groups: string[] }) => Array.isArray(g) && g.length > 0,
      },
    ];

    const { groups, isConfirm } = await this.prompts.call<{ groups: string[]; isConfirm: boolean }>(choices);

    if (groups.length > 0 && isConfirm === true) {
      return groups;
    }

    return false;
  }

  /**
   *
   * @param a
   * @param b
   */
  sort(a: dataGroupType, b: dataGroupType) {
    const pathA = a.path.toLowerCase();
    const pathB = b.path.toLowerCase();

    if (pathA === pathB) {
      return 0;
    }

    return pathA < pathB ? -1 : 1;
  }
}
