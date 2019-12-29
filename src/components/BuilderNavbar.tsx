import React from 'react';
import { Link } from 'react-router-dom';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  close: {
    color: theme.palette.common.white,
  },
}));

export function BuilderNavbar({
  tab,
  setTab,
}: {
  tab: number;
  setTab: (id: number) => any;
}) {
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
        <Tabs value={tab} onChange={(_e, value) => setTab(value)}>
          <Tab label="Workout A" />
          <Tab label="Workout B" />
        </Tabs>
      </AppBar>
    </React.Fragment>
  );
}
