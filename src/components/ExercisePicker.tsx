import values from 'lodash/values';
import range from 'lodash/range';
import find from 'lodash/find';
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
      variant="outlined"
      label="Sets"
      type="number"
      style={{ width: 50 }}
    />
  );
}

interface RepsPickerInterface {
  reps: number[];
  count: number;
  onChange: (params: any) => any;
}

function RepsPicker({ reps, onChange, count }: RepsPickerInterface) {
  return (
    <>
      {range(count).map((index: number) => (
        <Grid key={index} item md={1} sm={2} xs={4}>
          <TextField
            value={reps[index]}
            variant="outlined"
            onChange={event => {
              const newValue = parseInt(event.target.value);
              onChange({
                reps: update(reps, {
                  $splice: [
                    [index, 1, !newValue || newValue < 0 ? 0 : newValue],
                  ],
                }),
              });
            }}
            label={'Reps ' + (index + 1)}
            type="number"
            style={{ width: 60 }}
          />
        </Grid>
      ))}
    </>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    cursor: 'pointer',
  },
}));

export function ExercisePicker({
  id,
  index,
  multi,
  exerciseId,
  sets,
  reps,
  moveExercise,
  removeExercise,
  updateExercise,
}: {
  id: number;
  exerciseId: number;
  multi: boolean;
  sets: number;
  reps: number[];
  index: number;
  moveExercise: (dragIndex: number, hoverIndex: number) => any;
  removeExercise: (id: number) => any;
  updateExercise: (index: number, change: any) => any;
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
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Grid
        style={{ cursor: 'default' }}
        justify="flex-start"
        container
        spacing={2}
      >
        <Grid item xs={12}>
          <Autocomplete
            autoSelect
            options={exercisesList}
            getOptionLabel={option => option.name}
            style={{ maxWidth: 300 }}
            value={find(exercises, { id: exerciseId })}
            onChange={(_e, newValue) =>
              updateExercise(index, { exerciseId: newValue.id })
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
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={!!multi}
                onChange={() => updateExercise(index, { multi: !multi })}
                value="checkedB"
              />
            }
            label="Independent reps per set"
          />
        </Grid>
        <Grid item md={1} xs={12}>
          <SetsPicker
            value={sets}
            onChange={change => updateExercise(index, change)}
          />
        </Grid>
        <RepsPicker
          onChange={change => updateExercise(index, change)}
          reps={reps}
          count={multi ? sets : 1}
        />
      </Grid>
      <Box marginTop={3}>
        <Button onClick={() => removeExercise(id)}>Remove</Button>
      </Box>
    </Paper>
  );
}
