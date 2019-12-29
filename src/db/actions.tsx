import uuid from 'uuid/v4';
import { format } from 'date-fns';

import { WorkoutDatabaseCollections } from '../types';

const findNextSettings = async (
  previousSettingsId: number,
  db: WorkoutDatabaseCollections
) => {
  const nextSettings = await db.settings
    .findOne({ id: previousSettingsId + 1 + '', active: true })
    .exec();

  if (nextSettings) return nextSettings;

  return db.settings
    .findOne({ active: true })
    .sort('id')
    .exec();
};

export const startWorkout = async (db: WorkoutDatabaseCollections) => {
  const lastWorkout = await db.workouts
    .findOne()
    .sort('date')
    .exec();

  const settings = await findNextSettings(
    lastWorkout ? parseInt(lastWorkout.settings.id) : -1,
    db
  );

  return db.workouts.insert({
    id: `workout-${uuid()}`,
    date: format(new Date(), 'YYYY-MM-DD'),
    exercises: {},
    settings: settings!.toJSON(),
    state: 'ongoing',
    modelType: 'workout',
  });
};
