import React, { useEffect, useState, FunctionComponent } from 'react';
import * as _ from 'lodash';
import RxDB, { RxCollection, RxJsonSchema, RxDatabase } from 'rxdb';
import PouchDBIDB from 'pouchdb-adapter-idb';
import { format } from 'date-fns';
import uuid from 'uuid/v4';

import {
  Workout,
  Settings,
  WorkoutDocType,
  WorkoutCollection,
  WorkoutCollectionMethods,
} from './types';

type WorkoutDatabaseCollections = {
  workouts: WorkoutCollection;
};

RxDB.plugin(PouchDBIDB);

export const getDB = async () => {
  const db = await RxDB.create<WorkoutDatabaseCollections>({
    name: 'workouts',
    adapter: 'idb',
  });

  const workoutSchema: RxJsonSchema<WorkoutDocType> = {
    title: 'Workouts Schema',
    version: 1,
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
    },
    compoundIndexes: [['state', 'date']],
  };

  const workoutCollectionMethods: WorkoutCollectionMethods = {
    startWorkout: async (settings: Settings) =>
      db.workouts.insert({
        id: `workout-${uuid()}`,
        state: 'ongoing',
        date: format(new Date(), 'YYYY-MM-DD'),
        variant: await nextWorkoutVariant(settings),
        exercises: {},
      }),
  };

  await db.collection({
    name: 'workouts',
    schema: workoutSchema,
    statics: workoutCollectionMethods,
    migrationStrategies: {
      1: (fn: any) => fn,
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

  const useWorkouts = () => {
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    useEffect(() => {
      let unmounted = false;
      const query = db.workouts
        .find()
        .where('state')
        .in(['completed', 'ongoing'])
        .sort('date');

      const subscription = query.$.subscribe(
        result => !unmounted && setWorkouts(result)
      );

      return () => {
        unmounted = true;
        subscription.unsubscribe();
      };
    }, []);

    return workouts;
  };

  const useWorkout = (filter: any) => {
    const [state, setState] = useState<{
      workout?: Workout;
    }>({});

    useEffect(() => {
      let unmounted = false;

      const query = db.workouts.findOne(filter);

      const subscription = query.$.subscribe(result => {
        if (unmounted) return;
        if (result) setState({ workout: result || undefined });
        else setState({});
      });

      return () => {
        unmounted = true;
        subscription.unsubscribe();
      };
    }, [filter]);

    return state;
  };

  return {
    instance: db,
    useWorkout,
    useWorkouts,
  };
};

interface DBInterface {
  instance: RxDatabase<WorkoutDatabaseCollections>;
  useWorkouts: () => Workout[];
  useWorkout: (filter: any) => { workout: Workout };
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
