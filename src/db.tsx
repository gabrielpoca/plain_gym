import React, { useEffect, useState, FunctionComponent } from 'react';
import * as _ from 'lodash';
import RxDB, { RxJsonSchema, RxDatabase } from 'rxdb';
import PouchDBIDB from 'pouchdb-adapter-idb';
import { format } from 'date-fns';
import uuid from 'uuid/v4';

import { setupSync } from './database/sync';

import {
  Workout,
  Settings,
  WorkoutDocType,
  WorkoutDatabaseCollections,
  WorkoutCollectionMethods,
} from './types';

import * as api from './api';

RxDB.plugin(PouchDBIDB);

export const getDB = async () => {
  const db = await RxDB.create<WorkoutDatabaseCollections>({
    name: 'workouts',
    adapter: 'idb',
  });

  const workoutSchema: RxJsonSchema<WorkoutDocType> = {
    title: 'Workouts Schema',
    version: 2,
    type: 'object',
    properties: {
      id: {
        type: 'string',
        primary: true,
      },
      state: {
        type: 'string',
        index: true,
        enum: ['ongoing', 'cancelled', 'completed', 'deleted'],
      },
      date: {
        type: 'string',
        index: true,
        format: 'date',
      },
      variant: {
        type: 'string',
      },
      exercises: {
        type: 'object',
      },
      modelType: {
        type: 'string',
        default: 'workout',
        final: true,
      },
    },
    compoundIndexes: [['state', 'date']],
  };

  const nextWorkoutVariant = async function(settings: Settings) {
    const lastCompletedWorkout = await db.workouts
      .findOne()
      .where('state')
      .equals('completed')
      .sort('date')
      .exec();

    const lastVariant = _.get(lastCompletedWorkout, 'variant');

    if (!lastVariant) {
      return settings.workouts[0].variant;
    } else {
      const index = _.findIndex(settings.workouts, { variant: lastVariant });
      if (index + 1 > settings.workouts.length - 1)
        return settings.workouts[0].variant;
      else return settings.workouts[index + 1].variant;
    }
  };

  const workoutCollectionMethods: WorkoutCollectionMethods = {
    startWorkout: async (settings: Settings) => {
      return db.workouts.insert({
        id: `workout-${uuid()}`,
        state: 'ongoing',
        date: format(new Date(), 'YYYY-MM-DD'),
        variant: await nextWorkoutVariant(settings),
        exercises: {},
        modelType: 'workout',
      });
    },
  };

  await db.collection({
    name: 'workouts',
    schema: workoutSchema,
    statics: workoutCollectionMethods,
    migrationStrategies: {
      1: (fn: any) => fn,
      2: (doc: WorkoutDocType) => {
        doc.modelType = 'workout';
        return doc;
      },
    },
  });

  db.workouts.preInsert(async (plainData: WorkoutDocType) => {
    if (plainData.state !== 'ongoing') return;

    const ongoing = await db.workouts
      .findOne()
      .where('state')
      .equals('ongoing')
      .exec();

    if (ongoing) throw new Error('There is already an ongoing workout');
  }, false);

  if (!localStorage.getItem('couchToken'))
    api
      .signIn({
        session: { email: 'gabasdfasd@test.com', password: 'random' },
      })
      .catch(() =>
        api.signUp({
          user: { email: 'gabasdfasd@test.com', password: 'random' },
        })
      )
      .then(({ data }) => {
        localStorage.setItem('couchToken', data.couch_token);
        setupSync(db);
      });
  else setupSync(db);

  return {
    instance: db,
  };
};

interface DBInterface {
  instance: RxDatabase<WorkoutDatabaseCollections>;
}

export const DBContext = React.createContext<DBInterface | null>(null);

export const DBContextProvider: FunctionComponent<{}> = props => {
  const [db, setDB] = useState();

  useEffect(() => {
    getDB().then(newDB => setDB(newDB));
  }, []);

  if (!db) return null;

  return <DBContext.Provider value={db}>{props.children}</DBContext.Provider>;
};
