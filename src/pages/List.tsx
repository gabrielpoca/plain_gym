/** @jsx jsx */
import * as _ from 'lodash';
import React, { useContext, useState } from 'react';
import { jsx } from '@emotion/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

import AddIcon from '@material-ui/icons/Add';
import AppBar from '@material-ui/core/AppBar';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import PlayIcon from '@material-ui/icons/PlayArrow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';

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
  ongoing: {
    display: 'inline',
    fontSize: theme.typography.fontSize,
    marginLeft: theme.spacing(1),
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  drawer: {
    width: 250,
  },
}));

const filter = { state: 'ongoing' };

export function ListPage({ settings }: ListProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const db = useContext(DBContext);
  const classes = useStyles();
  const workouts = db!.useWorkouts();
  const { workout: ongoing } = db!.useWorkout(filter);

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Gym
          </Typography>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <div
          className={classes.drawer}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <List>
            <ListItem>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText>Vamos</ListItemText>
            </ListItem>
          </List>
        </div>
      </SwipeableDrawer>
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
                <ListItemText
                  primary={
                    <div>
                      Workout {workout.variant.toUpperCase()}
                      <Typography className={classes.ongoing} color="secondary">
                        ONGOING
                      </Typography>
                    </div>
                  }
                  secondary={workout.date}
                />
              </ListItem>
            ) : (
              <ListItem
                component={Link}
                to={`/workouts/review/${workout.id}`}
                key={workout.id}
                button
              >
                <ListItemText
                  primary={<div>Workout {workout.variant.toUpperCase()}</div>}
                  secondary={workout.date}
                />
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
