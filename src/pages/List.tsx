/** @jsx jsx */
import * as _ from 'lodash';
import React, { useContext } from 'react';
import { jsx } from '@emotion/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import PlayIcon from '@material-ui/icons/PlayArrow';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { DBContext } from '../db';
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

const filter = { state: 'ongoing' };

export function ListPage({ settings }: ListProps) {
  const db = useContext(DBContext);
  const classes = useStyles();
  const workouts = db!.useWorkouts();
  const { workout: ongoing } = db!.useWorkout(filter);

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
        {_.chain(workouts)
          .sortBy('state')
          .reverse()
          .map(workout =>
            workout.state === 'ongoing' ? (
              <ListItem
                component={Link}
                to={`/workouts/${workout.id}`}
                key={workout.id}
                button
              >
                <ListItemText>
                  ongoing: {workout.id} - {workout.date}
                </ListItemText>
              </ListItem>
            ) : (
              <ListItem
                component={Link}
                to={`/workouts/review/${workout.id}`}
                key={workout.id}
                button
              >
                <ListItemText>
                  {workout.id} - {workout.date}
                </ListItemText>
              </ListItem>
            )
          )
          .value()}
      </List>
      {ongoing ? (
        <Fab
          component={Link}
          className={classes.fab}
          color="primary"
          to={`/workouts/${ongoing.id}`}
        >
          <PlayIcon />
        </Fab>
      ) : (
        <Fab
          className={classes.fab}
          color="primary"
          onClick={() => db && db.instance.workouts.startWorkout(settings)}
        >
          <AddIcon />
        </Fab>
      )}
    </div>
  );
}
