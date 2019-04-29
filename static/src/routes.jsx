/* eslint new-cap: 0 */

import React from 'react';
import { Route } from 'react-router';

/* containers */
import { App } from './containers/App';
import { HomeContainer } from './containers/HomeContainer';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ProtectedView from './components/ProtectedView';
import Leaderboard from './components/Leaderboard';
import Record from './components/Record';

import Management from './components/Management';
import NotFound from './components/NotFound';

import { DetermineAuth } from './components/DetermineAuth';
import { requireAuthentication } from './components/AuthenticatedComponent';
import { requireNoAuthentication } from './components/notAuthenticatedComponent';

export default (
    <Route path="/" component={App}>
        <Route path="about" component={requireNoAuthentication(HomeContainer)} />
        <Route path="login" component={requireNoAuthentication(LoginView)} />
        <Route path="register" component={requireNoAuthentication(RegisterView)} />
        
        <Route path="leaderboard" component={requireAuthentication(Leaderboard)} />
        <Route path="record" component={requireAuthentication(Record)} />
        {/*<Route path="management" component={requireAuthentication(Management)} />*/}
        <Route path="*" component={DetermineAuth(NotFound)} />
    </Route>
);
