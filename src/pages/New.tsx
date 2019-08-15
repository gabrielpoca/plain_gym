/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';
import * as _ from 'lodash';
import React, { useReducer, useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { Timer } from '../components/Timer';
import { WorkoutExercise } from '../components/WorkoutExercise';
import { Settings, Workout, SettingsWorkout, SettingsExercise } from '../types';
import { db, useWorkout } from '../db';

interface ReducerState {
  settings?: SettingsWorkout;
  workout?: Workout;
  selectedStart: Date;
  selectedEnd: Date;
  selectedExerciseSet: string;
}

type SetAction = {
  type: 'set';
  exerciseId: string;
  setId: string;
  set: number;
};

type LoadAction = {
  type: 'load';
  settings: SettingsWorkout;
  workout: Workout;
};

interface NewProps {
  settings: Settings;
  id: string;
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  title: {
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
  action: SetAction | LoadAction
): ReducerState {
  switch (action.type) {
    case 'load':
      return { ...state, settings: action.settings, workout: action.workout };
    case 'set':
      const { workout, settings } = state;

      if (!workout || !settings) return state;

      const workoutExercise = workout.exercises[action.exerciseId] || {};
      let { rest, reps } = _.find(settings.exercises, {
        id: action.exerciseId,
      }) || { rest: 0, reps: 0 };

      const [selectedStart, selectedEnd] = getStartAndEndDate(rest);

      if (workoutExercise[action.set])
        reps = Math.max(workoutExercise[action.set] - 1, 0);

      return _.merge({}, state, {
        selectedEnd,
        selectedStart,
        selectedExerciseSet: action.setId,
        workout: {
          exercises: {
            [action.exerciseId]: {
              [action.set]: reps,
            },
          },
        },
      });
    default:
      throw new Error();
  }
}

const finishWorkout = (workout: Workout) => {
  console.log(workout);
  db.workouts.update(workout.id, {
    ...workout,
    state: 'completed',
  });
};

const cancelWorkout = (id: string) => {
  db.workouts.update(id, {
    state: 'cancelled',
  });
};

interface NavbarState {
  menuOpen: boolean;
  anchorEl?: HTMLButtonElement;
}

function Navbar({ workoutId }: { workoutId: string }) {
  const [state, setState] = useState({
    menuOpen: false,
  } as NavbarState);
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          New Workout
        </Typography>
        <IconButton
          aria-label="More"
          aria-owns={state.menuOpen ? 'long-menu' : undefined}
          aria-haspopup="true"
          onClick={e => setState({ menuOpen: true, anchorEl: e.currentTarget })}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          onClose={() => setState({ menuOpen: false, anchorEl: undefined })}
          onClick={() => db.workouts.delete(workoutId)}
          anchorEl={state.anchorEl}
          id="menu"
          open={state.menuOpen}
        >
          <MenuItem>Delete</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export const New = ({ settings, id }: NewProps) => {
  const classes = useStyles();
  const { workout, loading } = useWorkout(id)!;

  const [state, dispatch] = useReducer(reducer, {
    selectedStart: new Date(),
    selectedEnd: new Date(),
    selectedExerciseSet: '',
  });

  useEffect(() => {
    if (!workout) return;

    const settingsWorkout = _.find(settings.workouts, {
      variant: workout.variant,
    })!;

    dispatch({ type: 'load', workout, settings: settingsWorkout });
  }, [workout]);

  if (loading || !state.settings || !state.workout) return null;
  if (workout && workout.state !== 'ongoing') return <Redirect to="/" />;

  return (
    <div className={classes.root}>
      <Navbar workoutId={state.workout.id} />
      <ul className={classes.list}>
        {state.settings.exercises.map((exercise: SettingsExercise) => (
          <WorkoutExercise
            key={exercise.id}
            id={exercise.id}
            title={exercise.title}
            sets={exercise.sets}
            reps={exercise.reps}
            selectedExerciseSet={state.selectedExerciseSet}
            completedReps={_.get(state, `workout.exercises.${exercise.id}`, {})}
            onClick={({ set, setId }) =>
              dispatch({
                type: 'set',
                exerciseId: exercise.id,
                set,
                setId,
              })
            }
          />
        ))}
      </ul>
      <div css={{ position: 'fixed', bottom: 100, right: 20 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => cancelWorkout(state.workout!.id)}
          css={{ marginRight: 20 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => finishWorkout(state.workout!)}
        >
          Finish
        </Button>
      </div>
      <Timer start={state.selectedStart} end={state.selectedEnd} />
    </div>
  );
};
