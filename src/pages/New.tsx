/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash/get';
import merge from 'lodash/merge';
import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import update from 'immutability-helper';
import { BehaviorSubject, Subject } from 'rxjs';
import { scan } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { Timer } from '../components/Timer';
import { WorkoutExercise } from '../components/WorkoutExercise';
import { NewNavbar } from '../components/NewNavbar';
import { SettingsExercise } from '../types';
import { DBContext } from '../db';

import { useWorkout } from '../hooks/workouts';

interface ReducerState {
  selectedStart: Date;
  selectedEnd: Date;
  selectedExerciseSet: string;
}

type FinishSetAction = {
  type: 'finishSet';
  setId: string;
  rest: number;
};

type StopAction = {
  type: 'stop';
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
  actions: {
    marginTop: theme.spacing(4),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(10),
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const initialState = {
  selectedStart: new Date(),
  selectedEnd: new Date(),
  selectedExerciseSet: '',
};

function getStartAndEndDate(rest: number) {
  const selectedStart = new Date();
  const selectedEnd = new Date();
  selectedEnd.setSeconds(selectedStart.getSeconds() + rest);

  return [selectedStart, selectedEnd];
}

function reducer(
  state: ReducerState,
  action: FinishSetAction | StopAction
): ReducerState {
  switch (action.type) {
    case 'finishSet': {
      if (state.selectedExerciseSet === action.setId) return state;

      const [selectedStart, selectedEnd] = getStartAndEndDate(action.rest);

      return merge({}, state, {
        selectedEnd,
        selectedStart,
        selectedExerciseSet: action.setId,
      });
    }
    case 'stop': {
      return initialState;
    }
    default:
      console.log('jelrkwkslkf');
      throw new Error();
  }
}

const state$ = new BehaviorSubject(initialState);
const actions$ = new Subject<FinishSetAction | StopAction>();
actions$.pipe(scan(reducer, initialState)).subscribe(state$);

export const New = ({ id }: NewProps) => {
  const classes = useStyles();
  const db = useContext(DBContext);
  const workout = useWorkout(db!, id)!;
  const state = useObservable(() => state$, initialState, []);

  const updateSet = React.useCallback(
    (set: number, setId: string, exercise: SettingsExercise) => {
      const current = get(workout.exercises, `${exercise.id}.${set}`);

      const next =
        current && +current - 1 >= 0 ? +current - 1 : exercise.reps[set];

      const currentWorkout = workout.toJSON();

      const currentExercise = update(
        currentWorkout.exercises[exercise.id] || {},
        {
          $merge: {
            [set]: next,
          },
        }
      );

      workout.update({
        $set: update(currentWorkout, {
          exercises: {
            $merge: {
              [exercise.id]: currentExercise,
            },
          },
        }),
      });

      actions$.next({
        type: 'finishSet',
        setId,
        rest: workout.settings.rest,
      });
    },
    [workout]
  );

  if (!workout)
    return (
      <div className={classes.root}>
        <NewNavbar title="Ongoing" onDelete={() => null} />
      </div>
    );

  if (workout.state !== 'ongoing') return <Redirect to="/" />;

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
            selectedExerciseSet={state.selectedExerciseSet}
            completedReps={get(workout.exercises, exercise.id, {})}
            onClick={({ set, setId }) => {
              updateSet(set, setId, exercise);
            }}
          />
        ))}
      </ul>
      <div className={classes.actions}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            actions$.next({ type: 'stop' });
            workout.update({ $set: { state: 'cancelled' } });
          }}
          css={{ marginRight: 20 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            actions$.next({ type: 'stop' });
            workout.update({ $set: { state: 'completed' } });
          }}
        >
          Finish
        </Button>
      </div>
      <Timer start={state.selectedStart} end={state.selectedEnd} />
    </div>
  );
};
