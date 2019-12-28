import { useState, useEffect, useContext } from 'react';
import { RxDatabase } from 'rxdb';

import { DBContext } from '../db';
import { WorkoutDatabaseCollections, Settings } from '../types';

export const useSettings = () => {
  const db: RxDatabase<WorkoutDatabaseCollections> | null = useContext(
    DBContext
  );
  const [state, setState] = useState<{ settings: Settings }>();

  useEffect(() => {
    if (!db) return;

    const query = db.settings.findOne().sort('id');

    const subscription = query.$.subscribe(result => {
      if (!result) {
        db.settings.insert({
          id: '1',
          rest: 30,
          exercises: [
            {
              id: 1,
              multi: false,
              exerciseId: 81,
              sets: 3,
              reps: [5, 5, 5, 5, 5, 5, 5],
            },
            {
              id: 2,
              exerciseId: 81,
              multi: false,
              sets: 3,
              reps: [5, 5, 5, 5, 5, 5, 5],
            },
          ],
        });
      } else {
        setState({ settings: result } || undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, [db]);

  return state ? state.settings : undefined;
};
