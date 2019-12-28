import get from 'lodash/get';
import pick from 'lodash/pick';
import exercisesDataset from './dataset/exercises.json';

interface Exercise {
  id: number;
  name: string;
  description: string;
  equipment: number[];
}

interface Exercises {
  [id: number]: Exercise;
}

export const exercises: Exercises = exercisesDataset
  .filter(e => get(e, 'fields.language', 0) === 2)
  .reduce((memo: Exercises, e) => {
    if (!e.fields.name) return memo;

    memo[e.pk] = {
      ...pick(e.fields, ['name', 'description', 'equipment']),
      id: e.pk,
    };
    return memo;
  }, {});
