import values from 'lodash/values';
import range from 'lodash/range';
import React from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import update from 'immutability-helper';

import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { exercises } from '../exercises';
import { Box } from '@material-ui/core';

const exercisesList = values(exercises);

interface DragItem {
  id: number;
  index: number;
  type: string;
}

interface SetsPickerInterface {
  value?: number;
  onChange: (params: any) => any;
}

function SetsPicker(props: SetsPickerInterface) {
  return (
    <TextField
      {...props}
      onChange={event => {
        const newValue = parseInt(event.target.value);
        props.onChange({ sets: !newValue || newValue < 0 ? 0 : newValue });
      }}
      label="Sets"
      type="number"
      style={{ width: 40 }}
    />
  );
}

interface RepsPickerInterface {
  reps: {
    value: number[];
  };
  count: number;
  onChange: (params: any) => any;
}

function RepsPicker({ reps, onChange, count }: RepsPickerInterface) {
  return (
    <>
      {range(count).map((index: number) => (
        <Grid key={index} item md={1} sm={2} xs={4}>
          <TextField
            value={reps.value[index]}
            onChange={event => {
              const newValue = parseInt(event.target.value);
              onChange({
                reps: update(reps, {
                  value: {
                    $splice: [
                      [index, 1, !newValue || newValue < 0 ? 0 : newValue],
                    ],
                  },
                }),
              });
            }}
            label={'Reps ' + (index + 1)}
            type="number"
            style={{ width: 50 }}
          />
        </Grid>
      ))}
    </>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    paddingLeft: theme.spacing(5),
    marginBottom: theme.spacing(4),
    cursor: 'pointer',
  },
}));

export function ExercisePicker({
  id,
  index,
  multi,
  exercise,
  sets,
  reps,
  moveExercise,
  dispatch,
  onRemove,
}: {
  id: number;
  exercise?: {
    id: number;
    name: string;
  };
  multi: boolean;
  sets: number;
  reps: {
    multi: boolean;
    value: number[];
  };
  index: number;
  moveExercise: (dragIndex: number, hoverIndex: number) => any;
  dispatch: (params: any) => any;
  onRemove: () => any;
}) {
  const classes = useStyles();
  const ref = React.useRef(null);

  const [{ isDragging }, connectDrag] = useDrag({
    item: { id, index, type: 'EX' },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, connectDrop] = useDrop({
    accept: 'EX',
    hover(item: DragItem, _monitor: DropTargetMonitor) {
      if (!ref.current) return;

      const hoverIndex = index;

      if (hoverIndex === item.index) return;

      moveExercise(item.index, hoverIndex);
      item.index = hoverIndex;
    },
  });

  connectDrag(ref);
  connectDrop(ref);

  return (
    <Paper
      ref={ref}
      className={classes.root}
      style={{ opacity: isDragging ? 0 : 1 }}
    >
      <Grid
        style={{ cursor: 'default' }}
        justify="flex-start"
        container
        spacing={2}
      >
        <Grid item xs={12}>
          <Autocomplete
            options={exercisesList}
            getOptionLabel={option => option.name}
            style={{ width: 300 }}
            value={exercise}
            onChange={(_e, newValue) =>
              dispatch({
                type: 'UPDATE_EXERCISE',
                index,
                change: { exercise: newValue },
              })
            }
            renderInput={(params: any) => (
              <TextField
                {...params}
                label="Exercise"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={multi ? 12 : 4}>
          <FormControlLabel
            control={
              <Switch
                checked={!!multi}
                onChange={() =>
                  dispatch({
                    type: 'UPDATE_EXERCISE',
                    index,
                    change: { multi: !multi },
                  })
                }
                value="checkedB"
              />
            }
            label="Independent reps per set"
          />
        </Grid>
        <Grid item md={1} xs={12}>
          <SetsPicker
            value={sets}
            onChange={change =>
              dispatch({ type: 'UPDATE_EXERCISE', index, change })
            }
          />
        </Grid>
        <RepsPicker
          onChange={change =>
            dispatch({ type: 'UPDATE_EXERCISE', index, change })
          }
          reps={reps}
          count={multi ? sets : 1}
        />
      </Grid>
      <Box marginTop={3}>
        <Button onClick={() => onRemove()}>Remove</Button>
      </Box>
    </Paper>
  );
}
