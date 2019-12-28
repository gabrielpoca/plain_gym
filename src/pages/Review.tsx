/** @jsx jsx */
import { jsx } from '@emotion/core';
import merge from 'lodash/merge';
import get from 'lodash/get';
import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { WorkoutExercise } from '../components/WorkoutExercise';
import { NewNavbar } from '../components/NewNavbar';
import { Settings } from '../types';
import { DBContext } from '../db';

import { useWorkout } from '../hooks/workouts';

interface ReducerState {
  workoutSettings?: Settings;
  selectedStart: Date;
  selectedEnd: Date;
  selectedExerciseSet: string;
}

type StartWorkoutAction = {
  type: 'startWorkout';
  workoutSettings: Settings;
};

type FinishSetAction = {
  type: 'finishSet';
  setId: string;
  rest: number;
};

interface NewProps {
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

export const Review = ({ id }: NewProps) => {
  const classes = useStyles();
  const db = useContext(DBContext);
  const workout = useWorkout(db!, id)!;

  if (!workout) return null;
  if (workout.state === 'deleted') return <Redirect to="/" />;

  return (
    <div className={classes.root}>
      <NewNavbar
        title="Ongoing"
        onDelete={() => workout.update({ $set: { state: 'deleted' } })}
      />
      <ul className={classes.list}>
        {workout.settings.exercises.map(exercise => (
          <WorkoutExercise
            key={exercise.id}
            id={exercise.id}
            exerciseId={exercise.exerciseId}
            multi={exercise.multi}
            sets={exercise.sets}
            reps={exercise.reps}
            completedReps={get(workout.exercises, exercise.id, {})}
          />
        ))}
      </ul>
    </div>
  );
};
