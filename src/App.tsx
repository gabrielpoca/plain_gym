/** @jsx jsx */
import { jsx, Global, css } from '@emotion/core';
import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as _ from 'lodash';
import {
  BrowserRouter as Router,
  Route,
  Link,
  RouteComponentProps,
} from 'react-router-dom';

import settings from './settings.json';
import { New } from './pages/New';
import { ListPage } from './pages/List';
import { db, useWorkout } from './db';

const App = () => {
  const currentWorkout = useWorkout({ state: 'ongoing' });

  return (
    <div>
      <Router>
        <CssBaseline />
        <Global styles={css``} />
        <Route
          path="/workouts/:id"
          exact
          render={(props: RouteComponentProps<{ id: string }>) => {
            return <New settings={settings} id={props.match.params.id} />;
          }}
        />
        <Route path="/" exact render={() => <ListPage settings={settings} />} />
      </Router>
    </div>
  );
};

export default App;
