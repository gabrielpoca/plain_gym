/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';
import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

const selectedKeyframe = keyframes`
  from, 50%, to {
    opacity: 1;
  }

  25%, 74% {
   opacity: 0.2;
  }
`;

interface Props {
  reps: number;
  onClick: () => any;
  selected?: boolean;
}

const useStyles = makeStyles(theme => {
  return {
    root: {
      background: theme.palette.grey.A100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      width: 50,
      marginRight: 20,
      height: 50,
    },
    selected: {
      background: theme.palette.secondary.light,
    },
  };
});

export function WorkoutSet({ reps, onClick, selected }: Props) {
  const classes = useStyles();

  return (
    <li
      className={[classes.root, reps !== 0 ? classes.selected : null].join(' ')}
      style={{
        animation: selected ? `${selectedKeyframe} 1s ease 1` : '',
      }}
    >
      <button
        onClick={onClick}
        css={{
          background: 'none',
          border: 'none',
          width: '100%',
          fontSize: 'inherit',
          color: 'inherit',
          height: '100%',
        }}
      >
        {reps === 0 ? null : reps}
      </button>
    </li>
  );
}
