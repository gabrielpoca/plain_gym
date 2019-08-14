/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';
import React from 'react';
import * as _ from 'lodash';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { WorkoutSet } from './WorkoutSet';

const useStyles = makeStyles(theme => ({
  exercise: {
    padding: theme.spacing(2),
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
  id: string;
  title: string;
  sets: number;
  selectedExerciseSet: string;
  completedReps: CompletedReps;
  onClick: (params: OnClickParams) => any;
}

export function WorkoutExercise({
  sets,
  id,
  title,
  selectedExerciseSet,
  completedReps,
  onClick,
}: Props) {
  const classes = useStyles();

  return (
    <li key={id} css={{ margin: 0, padding: 0 }}>
      <Paper className={classes.exercise}>
        <Typography css={{ fontSize: 20, marginBottom: 10 }}>
          {title}
        </Typography>
        <ol
          css={{
            display: 'flex',
            justifyContent: 'flex-start',
            margin: 0,
            padding: 0,
          }}
        >
          {_.times(sets).map(time => {
            const set = time + 1;
            const setId = `${id}-${set}`;

            return (
              <WorkoutSet
                selected={selectedExerciseSet === setId}
                key={time}
                reps={_.get(completedReps, set, 0)}
                onClick={() => onClick({ set, setId })}
              />
            );
          })}
        </ol>
      </Paper>
    </li>
  );
}
