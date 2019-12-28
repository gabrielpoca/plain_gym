import findIndex from 'lodash/findIndex';
import pick from 'lodash/pick';
import range from 'lodash/range';
import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-multi-backend';
//@ts-ignore
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';

import { Container, Box } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { ExercisePicker } from '../components/ExercisePicker';
import { useSettings } from '../hooks/settings';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(8),
  },
  rest: {
    marginBottom: theme.spacing(3),
  },
  close: {
    color: theme.palette.common.white,
  },
  form: {
    paddingTop: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(1),
  },
  submit: {
    marginTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

function Navbar() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <AppBar position="fixed">
        <Toolbar>
          <Link to="/" className={classes.close}>
            <IconButton edge="start" color="inherit" aria-label="close">
              <CloseIcon />
            </IconButton>
          </Link>
          <Typography variant="h6">Workout Settings</Typography>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

export function Builder() {
  const classes = useStyles();
  const settings = useSettings();

  const removeExercise = React.useCallback(
    (id: number) => {
      const index = findIndex(settings!.exercises, { id });
      const currentSettings = pick(settings, ['exercises', 'rest']);

      settings!.update({
        $set: update(currentSettings, {
          exercises: { $splice: [[index, 1]] },
        }),
      });
    },
    [settings]
  );

  const moveExercise = React.useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (dragIndex === hoverIndex) return;
      const obj = settings!.exercises[dragIndex];
      const currentSettings = pick(settings, ['exercises', 'rest']);

      settings!.update({
        $set: update(currentSettings, {
          exercises: {
            $splice: [[dragIndex, 1], [hoverIndex, 0, obj]],
          },
        }),
      });
    },
    [settings]
  );

  const updateExercise = React.useCallback(
    (index: number, change: any) => {
      const currentSettings = pick(settings, ['exercises', 'rest']);
      settings!.update({
        $set: update(currentSettings, {
          exercises: { [index]: { $merge: change } },
        }),
      });
    },
    [settings]
  );

  const addExercise = React.useCallback(() => {
    const currentSettings = pick(settings, ['exercises', 'rest']);

    const highest = currentSettings.exercises!.reduce((memo, ex) => {
      return ex.id > memo ? ex.id : memo;
    }, 0);

    settings!.update({
      $set: update(currentSettings, {
        exercises: {
          $splice: [
            [
              currentSettings.exercises!.length,
              0,
              {
                id: highest + 1,
                multi: false,
                exerciseId: 81,
                sets: 3,
                reps: range(30).map(() => 5),
              },
            ],
          ],
        },
      }),
    });
  }, [settings]);

  if (!settings)
    return (
      <Container className={classes.root}>
        <Navbar />
      </Container>
    );

  return (
    <DndProvider backend={Backend} options={HTML5toTouch}>
      <Container className={classes.root}>
        <Navbar />
        <form>
          <Box display="inline-block" marginTop={2}>
            <TextField
              label="Rest between sets"
              fullWidth
              type="number"
              helperText="in seconds"
              value={settings.rest}
              onChange={event =>
                settings.update({
                  $set: { rest: parseInt(event.target.value) },
                })
              }
              className={classes.rest}
            />
          </Box>
          {settings.exercises.map((exercise: any, index: number) => (
            <ExercisePicker
              {...exercise}
              key={exercise.id}
              index={index}
              removeExercise={removeExercise}
              moveExercise={moveExercise}
              updateExercise={updateExercise}
            />
          ))}
        </form>
        <Button color="primary" variant="contained" onClick={addExercise}>
          New Exercise
        </Button>
      </Container>
    </DndProvider>
  );
}
