import { useState, useEffect } from 'react';
import { RxDatabase } from 'rxdb';

import { WorkoutDatabaseCollections, Workout } from '../types';

export const useWorkouts = (db: RxDatabase<WorkoutDatabaseCollections>) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const query = db.workouts
      .find()
      .where('state')
      .in(['completed', 'ongoing'])
      .sort('date');

    const subscription = query.$.subscribe(result => setWorkouts(result));

    return () => subscription.unsubscribe();
  }, [db.workouts]);

  return workouts;
};

export const useWorkout = (
  db: RxDatabase<WorkoutDatabaseCollections>,
  filter: any
) => {
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
  }, [filter, db.workouts]);

  return state.workout;
};
