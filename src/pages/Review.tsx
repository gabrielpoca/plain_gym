/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash/get';
import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { WorkoutExercise } from '../components/WorkoutExercise';
import { NewNavbar } from '../components/NewNavbar';
import { DBContext } from '../db';

import { useWorkout } from '../hooks/workouts';

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

export const Review = ({ id }: NewProps) => {
  const classes = useStyles();
  const db = useContext(DBContext);
  const workout = useWorkout(db!, id)!;

  if (!workout)
    return (
      <div className={classes.root}>
        <NewNavbar title="Ongoing" />
      </div>
    );

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
