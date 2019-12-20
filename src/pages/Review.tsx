/** @jsx jsx */
import { jsx } from '@emotion/core';
import merge from 'lodash/merge';
import find from 'lodash/find';
import get from 'lodash/get';
import React, { useReducer, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { exercises } from '../exercises';
import { WorkoutExercise } from '../components/WorkoutExercise';
import { NewNavbar } from '../components/NewNavbar';
import { Settings, SettingsWorkout, SettingsExercise } from '../types';
import { DBContext } from '../db';

import { useWorkout } from '../hooks/workouts';

interface ReducerState {
  workoutSettings?: SettingsWorkout;
  selectedStart: Date;
  selectedEnd: Date;
  selectedExerciseSet: string;
}

type StartWorkoutAction = {
  type: 'startWorkout';
  workoutSettings: SettingsWorkout;
};

type FinishSetAction = {
  type: 'finishSet';
  setId: string;
  rest: number;
};

interface NewProps {
  settings: Settings;
  id: string;
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  exercise: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  list: {
    listStyle: 'none',
    margin: theme.spacing(2),
    padding: 0,
  },
}));

function getStartAndEndDate(rest: number) {
  const selectedStart = new Date();
  const selectedEnd = new Date();
  selectedEnd.setSeconds(selectedStart.getSeconds() + rest);

  return [selectedStart, selectedEnd];
}

function reducer(
  state: ReducerState,
  action: FinishSetAction | StartWorkoutAction
): ReducerState {
  switch (action.type) {
    case 'startWorkout': {
      return { ...state, workoutSettings: action.workoutSettings };
    }
    case 'finishSet': {
      const [selectedStart, selectedEnd] = getStartAndEndDate(action.rest);

      return merge({}, state, {
        selectedEnd,
        selectedStart,
        selectedExerciseSet: action.setId,
      });
    }
    default:
      throw new Error();
  }
}

export const Review = ({ settings, id }: NewProps) => {
  const classes = useStyles();
  const db = useContext(DBContext);
  const { workout } = useWorkout(db!.instance, id)!;
  const [state, dispatch] = useReducer(reducer, {
    selectedStart: new Date(),
    selectedEnd: new Date(),
    selectedExerciseSet: '',
  });

  useEffect(() => {
    if (!workout) return;

    const workoutSettings = find(settings.workouts, {
      variant: workout.variant,
    })!;

    dispatch({ type: 'startWorkout', workoutSettings: workoutSettings });
  }, [workout, settings.workouts]);

  if (!workout || !state.workoutSettings) return null;
  if (workout.state === 'deleted') return <Redirect to="/" />;

  return (
    <div className={classes.root}>
      <NewNavbar
        title="Review"
        onDelete={() => workout.update({ $set: { state: 'deleted' } })}
      />
      <ul className={classes.list}>
        {state.workoutSettings.exercises.map((exercise: SettingsExercise) => (
          <WorkoutExercise
            disabled
            key={exercise.id}
            id={exercise.id}
            title={exercises[exercise.id].name}
            sets={exercise.sets}
            reps={exercise.reps}
            selectedExerciseSet={state.selectedExerciseSet}
            completedReps={get(workout.exercises, exercise.id, {})}
          />
        ))}
      </ul>
    </div>
  );
};
