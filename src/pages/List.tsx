/** @jsx jsx */
import React, { useEffect } from 'react';
import { jsx } from '@emotion/core';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { useWorkouts } from '../db';

interface ListProps {
  startWorkout: () => any;
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

export function ListPage({ startWorkout }: ListProps) {
  const classes = useStyles();
  const workouts = useWorkouts();

  console.log(workouts);

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
          <ListItem key={workout.id} button>
            <ListItemText>{workout.id}</ListItemText>
          </ListItem>
        ))}
      </List>
      <Fab className={classes.fab} color="primary" onClick={startWorkout}>
        <AddIcon />
      </Fab>
    </div>
  );
}
