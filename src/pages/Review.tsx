/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as _ from 'lodash';
import React, { useReducer, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { exercises } from '../exercises'
import { WorkoutExercise } from '../components/WorkoutExercise';
import { NewNavbar } from '../components/NewNavbar';
import { Settings, Workout, SettingsWorkout, SettingsExercise } from '../types';
import { DBContext } from '../db';

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

function updateWorkoutSet(
  exerciseId: string,
  set: number,
  workout: Workout,
  workoutSettings: SettingsWorkout
): { rest: number } {
  const workoutExercise = workout.exercises[exerciseId] || {};

  let { rest, reps } = _.find(workoutSettings.exercises, {
    id: exerciseId,
  }) || { rest: 0, reps: 0 };

  if (workoutExercise[set]) reps = Math.max(workoutExercise[set] - 1, 0);

  workout.update({
    $set: {
      exercises: _.merge(workout.exercises, {
        [exerciseId]: {
          [set]: reps,
        },
      }),
    },
  });

  return { rest };
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

      return _.merge({}, state, {
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
  const { workout } = db!.useWorkout(id)!;
  const [state, dispatch] = useReducer(reducer, {
    selectedStart: new Date(),
    selectedEnd: new Date(),
    selectedExerciseSet: '',
  });

  useEffect(() => {
    if (!workout) return;

    const workoutSettings = _.find(settings.workouts, {
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
            title={exercises[exercise.id]}
            sets={exercise.sets}
            reps={exercise.reps}
            selectedExerciseSet={state.selectedExerciseSet}
            completedReps={_.get(workout.exercises, exercise.id, {})}
          />
        ))}
      </ul>
    </div>
  );
};
