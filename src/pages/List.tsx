/** @jsx jsx */
import * as _ from 'lodash';
import React, { useContext, useState, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link, Redirect } from 'react-router-dom';

import AddIcon from '@material-ui/icons/Add';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
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
import Container from '@material-ui/core/Container';

import { DBContext } from '../db';
import { Settings } from '../types';

interface ListProps {
  settings: Settings;
}

interface SidebarProps {
  open: boolean;
  onClose: () => any;
  onOpen: () => any;
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
    paddingTop: theme.spacing(8),
  },
}));

const filter = { state: 'ongoing' };

function Sidebar({ open, onClose, onOpen }: SidebarProps) {
  const classes = useStyles();

  return (
    <SwipeableDrawer
      open={open}
      onClose={() => onClose()}
      onOpen={() => onOpen()}
    >
      <div
        className={classes.drawer}
        role="presentation"
        onClick={() => onClose()}
        onKeyDown={() => onClose()}
      >
        <List>
          <ListItem component={Link} to="/sign-up">
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText>Account</ListItemText>
          </ListItem>
          <ListItem component={Link} to="/builder">
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText>Builder</ListItemText>
          </ListItem>
        </List>
      </div>
    </SwipeableDrawer>
  );
}

export function ListPage({ settings }: ListProps) {
  const [startWorkout, setStartWorkout] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const db = useContext(DBContext);
  const classes = useStyles();
  const workouts = db!.useWorkouts();
  const { workout: ongoing } = db!.useWorkout(filter);

  useEffect(() => {
    if (!startWorkout || ongoing) return;

    db!.instance.workouts.startWorkout(settings);
  }, [startWorkout, ongoing, db, settings]);

  if (startWorkout && ongoing)
    return <Redirect to={`/workouts/${ongoing.id}`} />;

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
      <Sidebar
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      />
      <Container>
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
                        <Typography
                          className={classes.ongoing}
                          color="secondary"
                        >
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
            onClick={() => setStartWorkout(true)}
          >
            <AddIcon />
          </Fab>
        )}
      </Container>
    </div>
  );
}
