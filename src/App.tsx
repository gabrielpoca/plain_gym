/** @jsx jsx */
import { jsx, Global, css } from '@emotion/core';
import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as _ from 'lodash';

import settings from './settings.json';
import { New } from './pages/New';
import { ListPage } from './pages/List';
import { db, useWorkout } from './db';

let runningNew = false;

async function nextWorkoutVariant() {
  const result = await db.workouts
    .where('state')
    .equals('completed')
    .reverse()
    .sortBy('date');

  const lastVariant = _.get(result[0], 'variant');

  if (!lastVariant) {
    return settings.workouts[0].variant;
  } else {
    const index = _.findIndex(settings.workouts, { variant: lastVariant });
    if (index + 1 > settings.workouts.length - 1)
      return settings.workouts[0].variant;
    else return settings.workouts[index + 1].variant;
  }
}

const App = () => {
  const currentWorkout = useWorkout({ state: 'ongoing' });

  return (
    <div>
      <CssBaseline />
      <Global styles={css``} />
      {currentWorkout ? (
        <New
          workout={currentWorkout}
          settings={
            _.find(settings.workouts, {
              variant: currentWorkout.variant,
            })!
          }
        />
      ) : (
        <ListPage
          startWorkout={async () => {
            if (runningNew) return;
            runningNew = true;

            await db.workouts.add({
              id: `randomshit ${Math.random()}`,
              state: 'ongoing',
              date: new Date(),
              variant: await nextWorkoutVariant(),
              exercises: {},
            });

            runningNew = false;
          }}
        />
      )}
    </div>
  );
};

export default App;
