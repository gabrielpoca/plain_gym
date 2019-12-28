import React, { useEffect, useState, FunctionComponent } from 'react';
import RxDB, { RxJsonSchema, RxDatabase } from 'rxdb';
import PouchDBIDB from 'pouchdb-adapter-idb';
import { format } from 'date-fns';
import uuid from 'uuid/v4';
import update from 'immutability-helper';

import { setupSync } from './database/sync';

import {
  Settings,
  SettingsDocType,
  WorkoutDocType,
  WorkoutDatabaseCollections,
  WorkoutCollectionMethods,
} from './types';

import * as api from './api';

RxDB.plugin(PouchDBIDB);

const settingsJSONSchema: any = {
  id: {
    type: 'string',
  },
  rest: {
    type: 'number',
  },
  exercises: {
    type: 'array',
    items: {
      type: 'object',
      required: ['id', 'sets', 'reps'],
      properties: {
        id: {
          type: 'number',
        },
        multi: {
          type: 'boolean',
        },
        sets: {
          type: 'number',
        },
        reps: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      },
    },
  },
};

export const getDB = async () => {
  const db = await RxDB.create<WorkoutDatabaseCollections>({
    name: 'workouts',
    adapter: 'idb',
  });

  const workoutSchema: RxJsonSchema<WorkoutDocType> = {
    title: 'Workouts Schema',
    version: 0,
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
      settings: {
        type: 'object',
        properties: settingsJSONSchema,
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

  const settingsSchema: RxJsonSchema<SettingsDocType> = {
    title: 'Settings Schema',
    version: 0,
    type: 'object',
    required: ['id', 'rest', 'exercises'],
    properties: update(settingsJSONSchema, {
      id: { $merge: { primary: true } },
    }),
  };

  const workoutCollectionMethods: WorkoutCollectionMethods = {
    startWorkout: async (settings: Settings) => {
      return db.workouts.insert({
        id: `workout-${uuid()}`,
        date: format(new Date(), 'YYYY-MM-DD'),
        exercises: {},
        settings: settings.toJSON(),
        state: 'ongoing',
        modelType: 'workout',
      });
    },
  };

  await db.collection({
    name: 'workouts',
    schema: workoutSchema,
    statics: workoutCollectionMethods,
    migrationStrategies: {},
  });

  await db.collection({
    name: 'settings',
    schema: settingsSchema,
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

  return db;
};

export const DBContext = React.createContext<RxDatabase<
  WorkoutDatabaseCollections
> | null>(null);

export const DBContextProvider: FunctionComponent<{}> = props => {
  const [db, setDB] = useState();

  useEffect(() => {
    getDB().then(newDB => setDB(newDB));
  }, []);

  if (!db) return null;

  return <DBContext.Provider value={db}>{props.children}</DBContext.Provider>;
};
