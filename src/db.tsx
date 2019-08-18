import React, { useEffect, useState, FunctionComponent } from 'react';
import * as _ from 'lodash';
import RxDB, { RxCollection, RxJsonSchema, RxDatabase } from 'rxdb';
import PouchDB from 'pouchdb';
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

import * as api from './api';

const asciiToHex = (str: string) => {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join('');
};

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

  const workoutCollectionMethods: WorkoutCollectionMethods = {
    startWorkout: async (settings: Settings) =>
      db.workouts.insert({
        id: `workout-${uuid()}`,
        state: 'ongoing',
        date: format(new Date(), 'YYYY-MM-DD'),
        variant: await nextWorkoutVariant(settings),
        exercises: {},
        modelType: 'workout',
      }),
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
        runPouch();
      });
  else runPouch();

  async function runPouch() {
    try {
      const dbName = `https://couch.gabrielpoca.com/userdb-${asciiToHex(
        'gabasdfasd@test.com'
      )}`;
      const remoteDB = new PouchDB(dbName, {
        fetch: function(url, opts) {
          // @ts-ignore
          opts.headers!['X-Auth-CouchDB-UserName'] = 'gabriel@test.com';
          // @ts-ignore
          opts.headers!['X-Auth-CouchDB-Token'] = localStorage.getItem(
            'couchToken'
          );
          return PouchDB.fetch(url, opts);
        },
      });

      try {
        await remoteDB.put({
          _id: '_design/gym',
          filters: {
            workouts: `function(doc) {
              return (doc._id === '_design/gym' || doc.modelType === 'workout');
            }`,
          },
        });
      } catch (e) {}
      db.workouts.sync({
        remote: remoteDB,
        // @ts-ignore
        options: {
          live: true,
          retry: true,
          filter: 'gym/workouts',
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

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
