/** @jsx jsx */
import React from 'react';
import { jsx, Global, css } from '@emotion/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  BrowserRouter as Router,
  Route,
  RouteComponentProps,
} from 'react-router-dom';

import settings from './settings.json';
import { New } from './pages/New';
import { ListPage } from './pages/List';
import { Review } from './pages/Review';
import { DBContextProvider } from './db';

const App = () => {
  return (
    <div>
      <DBContextProvider>
        <Router>
          <CssBaseline />
          <Global styles={css``} />
          <Route
            path="/workouts/review/:id"
            exact
            render={(props: RouteComponentProps<{ id: string }>) => {
              return <Review settings={settings} id={props.match.params.id} />;
            }}
          />
          <Route
            path="/workouts/:id"
            exact
            render={(props: RouteComponentProps<{ id: string }>) => {
              return <New settings={settings} id={props.match.params.id} />;
            }}
          />
          <Route
            path="/"
            exact
            render={() => <ListPage settings={settings} />}
          />
        </Router>
      </DBContextProvider>
    </div>
  );
};

export default App;
