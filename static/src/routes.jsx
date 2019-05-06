/* eslint new-cap: 0 */

import React from 'react';
import { Route } from 'react-router';

/* containers */
import { App } from './containers/App';

import {Home, Login, NotFound, Register, Leaderboard, Record, Settings} from './components/pages/index.jsx';

import { DetermineAuth } from './components/DetermineAuth';
import { requireAuthentication } from './components/AuthenticatedComponent';
import { requireNoAuthentication } from './components/notAuthenticatedComponent';

export default (
  <Route path="/" component={App}>
    <Route path="about" component={requireNoAuthentication(Home)} />
    <Route path="login" component={requireNoAuthentication(Login)} />
    <Route path="register" component={requireNoAuthentication(Register)} />
    
    <Route path="leaderboard" component={requireAuthentication(Leaderboard)} />
    <Route path="record" component={requireAuthentication(Record)} />
    <Route path="settings" component={requireAuthentication(Settings)} />
    {/*<Route path="management" component={requireAuthentication(Management)} />*/}
    <Route path="*" component={DetermineAuth(NotFound)} />
  </Route>
);
