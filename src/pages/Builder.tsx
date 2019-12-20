import findIndex from 'lodash/findIndex';
import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
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

import { ExercisePicker } from '../components/ExercisePicker';

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
      <div style={{ height: 60 }} />
      <AppBar position="fixed">
        <Toolbar>
          <Link to="/" className={classes.close}>
            <IconButton edge="start" color="inherit" aria-label="close">
              <CloseIcon />
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

interface BuilderExercise {
  id: number;
  sets: number;
  multi: boolean;
  exercise?: {
    id: number;
    name: string;
  };
  reps: {
    value: number[];
  };
}

interface BuilderState {
  rest: number;
  exercises: BuilderExercise[];
}

export function Builder() {
  const classes = useStyles();

  const [{ exercises, rest }, dispatch] = React.useReducer(
    (state: BuilderState, action) => {
      switch (action.type) {
        case 'MOVE_TO_POSITION':
          const { dragIndex, hoverIndex } = action;
          const obj = state.exercises[dragIndex];

          return update(state, {
            exercises: { $splice: [[dragIndex, 1], [hoverIndex, 0, obj]] },
          });
        case 'ADD_EXERCISE': {
          const highest = state.exercises.reduce((memo, ex) => {
            return ex.id > memo ? ex.id : memo;
          }, 0);
          return update(state, {
            exercises: {
              $splice: [
                [
                  state.exercises.length,
                  0,
                  {
                    id: highest + 1,
                    multi: false,
                    sets: 3,
                    reps: { value: [5, 5, 5, 5, 5, 5, 5] },
                  },
                ],
              ],
            },
          });
        }

        case 'REMOVE_EXERCISE': {
          const index = findIndex(state.exercises, { id: action.id });
          return update(state, { exercises: { $splice: [[index, 1]] } });
        }

        case 'UPDATE_REST':
          return update(state, { $merge: { rest: action.rest } });
        case 'UPDATE_EXERCISE': {
          const { index, change } = action;
          return update(state, { exercises: { [index]: { $merge: change } } });
        }
      }

      return state;
    },
    {
      rest: 30,
      exercises: [
        {
          id: 1,
          multi: false,
          sets: 3,
          reps: { value: [5, 5, 5, 5, 5, 5, 5] },
        },
        {
          id: 2,
          multi: false,
          sets: 3,
          reps: { value: [5, 5, 5, 5, 5, 5, 5] },
        },
      ],
    }
  );

  const moveExercise = React.useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (dragIndex === hoverIndex) return;
      dispatch({ type: 'MOVE_TO_POSITION', dragIndex, hoverIndex });
    },
    []
  );

  return (
    <DndProvider backend={Backend}>
      <Container className={classes.root}>
        <Navbar />
        <form>
          <Box display="inline-block">
            <TextField
              label="Rest between sets"
              fullWidth
              type="number"
              helperText="In seconds"
              value={rest}
              onChange={event => {
                const newValue = parseInt(event.target.value);
                dispatch({
                  type: 'UPDATE_REST',
                  rest: !newValue || newValue < 0 ? 0 : newValue,
                });
              }}
              className={classes.rest}
            />
          </Box>
          {exercises.map((exercise: any, index: number) => (
            <ExercisePicker
              {...exercise}
              key={exercise.id}
              index={index}
              moveExercise={moveExercise}
              dispatch={dispatch}
              onRemove={() =>
                dispatch({ type: 'REMOVE_EXERCISE', id: exercise.id })
              }
            />
          ))}
        </form>
        <Button
          color="primary"
          variant="contained"
          onClick={() => dispatch({ type: 'ADD_EXERCISE' })}
        >
          New Exercise
        </Button>
      </Container>
    </DndProvider>
  );
}
