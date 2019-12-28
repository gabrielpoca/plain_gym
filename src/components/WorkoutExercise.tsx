/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import times from 'lodash/times';
import get from 'lodash/get';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { exercises } from '../exercises';
import { WorkoutSet } from './WorkoutSet';

const useStyles = makeStyles(theme => ({
  exercise: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
}));

interface CompletedReps {
  [set: number]: number;
}

interface OnClickParams {
  set: number;
  setId: string;
}

interface Props {
  id: number;
  multi: boolean;
  sets: number;
  exerciseId: number;
  reps: number[];
  selectedExerciseSet?: string;
  completedReps: CompletedReps;
  onClick?: (params: OnClickParams) => any;
  disabled?: boolean;
}

export function WorkoutExercise({
  sets,
  multi,
  reps,
  id,
  exerciseId,
  selectedExerciseSet,
  completedReps,
  disabled,
  onClick,
}: Props) {
  const classes = useStyles();
  const title = exercises[exerciseId].name;

  return (
    <li key={id} css={{ margin: 0, padding: 0 }}>
      <Paper className={classes.exercise}>
        <Typography className={classes.title}>
          {title} {sets}x{multi ? '' : reps[0]}
        </Typography>
        <ol
          css={{
            display: 'flex',
            justifyContent: 'flex-start',
            margin: 0,
            padding: 0,
          }}
        >
          {times(sets).map(time => {
            const setId = `${id}-${time}`;

            return (
              <WorkoutSet
                disabled={!!disabled}
                selected={selectedExerciseSet === setId}
                key={time}
                reps={multi ? reps[time] : reps[0]}
                completedReps={get(completedReps, time)}
                onClick={() => onClick && onClick({ set: time, setId })}
              />
            );
          })}
        </ol>
      </Paper>
    </li>
  );
}
