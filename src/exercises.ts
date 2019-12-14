import _ from 'lodash';
import exercisesDataset from './dataset/exercises.json';

interface Exercise {
  name: string;
  description: string;
  equipment: number[];
}

interface Exercises {
  [id: number]: Exercise;
}

export const exercises: Exercises = exercisesDataset
  .filter(e => _.get(e, 'fields.language', 0) === 2)
  .reduce((memo: Exercises, e) => {
    if (!e.fields.name) return memo;

    memo[e.pk] = _.pick(e.fields, ['name', 'description', 'equipment']);
    return memo;
  }, {});
