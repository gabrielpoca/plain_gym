/** @jsx jsx */
import React, { useEffect } from 'react';
import { jsx } from '@emotion/core';
import { makeStyles } from '@material-ui/core/styles';
import * as _ from 'lodash';
import { Link, Redirect } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { useWorkouts, useWorkout, db } from '../db';
import { Settings } from '../types';

interface ListProps {
  settings: Settings;
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  list: {
    paddingTop: 70,
  },
}));

const nextWorkoutVariant = async (settings: Settings) => {
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
};

const startWorkout = async (settings: Settings) => {
  await db.workouts.add({
    id: `workout-${Math.random()}`,
    state: 'ongoing',
    date: new Date(),
    variant: await nextWorkoutVariant(settings),
    exercises: {},
  });
};

export function ListPage({ settings }: ListProps) {
  const classes = useStyles();
  const workouts = useWorkouts();
  const { workout: ongoing } = useWorkout({ state: 'ongoing' });

  if (ongoing) return <Redirect to={`/workouts/${ongoing.id}`} />;

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Gym
          </Typography>
        </Toolbar>
      </AppBar>
      <List className={classes.list}>
        {workouts.map(workout => (
          <ListItem
            component={Link}
            to={`/workouts/${workout.id}`}
            key={workout.id}
            button
          >
            <ListItemText>{workout.id}</ListItemText>
          </ListItem>
        ))}
      </List>
      <Fab
        className={classes.fab}
        color="primary"
        onClick={() => startWorkout(settings)}
      >
        <AddIcon />
      </Fab>
    </div>
  );
}
