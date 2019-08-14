import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { useEffect, useState } from 'react';
import Dexie from 'dexie';
import 'dexie-observable';

import { Workout } from './types';

class GymDatabase extends Dexie {
  public workouts: Dexie.Table<Workout, string>;

  public constructor() {
    super('GymDatabase');

    this.version(1).stores({
      workouts: '++id,state',
    });

    this.workouts = this.table('workouts');
  }
}

export const db = new GymDatabase();

export const observer = new Observable(subscriber => {
  db.on('changes', changes => {
    changes.map(change => {
      if (change.table === 'workouts')
        subscriber.next({
          type:
            change.type === 1
              ? 'create'
              : change.type === 2
              ? 'update'
              : 'delete',
          obj: _.get(change, 'obj', null),
          key: change.key,
        });
    });
  });
});

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    let unmounted = false;
    db.workouts
      .where({ state: 'completed' })
      .toArray()
      .then(setWorkouts);

    const subscription = observer.subscribe({
      next: async () => {
        if (unmounted) return;

        db.workouts
          .where({ state: 'completed' })
          .toArray()
          .then(setWorkouts);
      },
    });

    return () => {
      unmounted = true;
      subscription.unsubscribe();
    };
  }, []);

  return workouts;
};

export const useWorkout = (filter: any) => {
  const [workout, setWorkout] = useState<Workout>();

  useEffect(() => {
    let unmounted = false;
    db.workouts.get(filter).then(setWorkout);

    const subscription = observer.subscribe({
      next: async () => {
        if (unmounted) return;

        db.workouts.get(filter).then(setWorkout);
      },
    });

    return () => {
      unmounted = true;
      subscription.unsubscribe();
    };
  }, []);

  return workout;
};
