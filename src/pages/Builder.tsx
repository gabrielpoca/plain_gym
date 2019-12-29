import findIndex from 'lodash/findIndex';
import pick from 'lodash/pick';
import range from 'lodash/range';
import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-multi-backend';
//@ts-ignore
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';
import update from 'immutability-helper';

import { Container, Box } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import { ExercisePicker } from '../components/ExercisePicker';
import { BuilderNavbar as Navbar } from '../components/BuilderNavbar';
import { useSettings } from '../hooks/settings';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(8),
  },
  rest: {
    marginBottom: theme.spacing(3),
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

export function Builder() {
  const classes = useStyles();
  const [tab, setTab] = React.useState(0);
  const settings = useSettings(tab + '');

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
        <Navbar tab={tab} setTab={setTab} />
      </Container>
    );

  return (
    <DndProvider backend={Backend} options={HTML5toTouch}>
      <Container className={classes.root}>
        <Navbar tab={tab} setTab={setTab} />
        <form style={settings.active ? {} : { opacity: 0.5 }}>
          <Box marginTop={8}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.active}
                  onChange={event =>
                    settings.update({ $set: { active: event.target.checked } })
                  }
                />
              }
              label="Active"
            />
          </Box>
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
          <Button color="primary" variant="contained" onClick={addExercise}>
            New Exercise
          </Button>
        </form>
      </Container>
    </DndProvider>
  );
}
