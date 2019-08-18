import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CloseIcon from '@material-ui/icons/Close';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

interface NavbarState {
  menuOpen: boolean;
  anchorEl?: HTMLButtonElement;
}

const useStyles = makeStyles(theme => ({
  title: {
    flexGrow: 1,
  },
  button: {
    color: theme.palette.common.white,
  },
}));

export function NewNavbar({
  onDelete,
  title,
}: {
  onDelete: () => any;
  title: string;
}) {
  const [state, setState] = useState({
    menuOpen: false,
  } as NavbarState);

  const classes = useStyles();

  return (
    <React.Fragment>
      <div style={{ height: 60 }} />
      <AppBar position="fixed">
        <Toolbar>
          <Link to="/" className={classes.button}>
            <IconButton edge="start" color="inherit" aria-label="close">
              <CloseIcon />
            </IconButton>
          </Link>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
          <IconButton
            aria-label="More"
            aria-owns={state.menuOpen ? 'long-menu' : undefined}
            aria-haspopup="true"
            onClick={e => setState({ menuOpen: true, anchorEl: e.currentTarget })}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            onClose={() => setState({ menuOpen: false, anchorEl: undefined })}
            onClick={onDelete}
            anchorEl={state.anchorEl}
            id="menu"
            open={state.menuOpen}
          >
            <MenuItem>Delete</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}
