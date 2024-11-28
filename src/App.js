import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Chat from './Chat';
import VideoCall from './VideoCall';
import Register from './Register';
import ErrorBoundary from './ErrorBoundary'; // ErrorBoundary'i içe aktar

function App() {
  return (
    <ErrorBoundary> {/* Tüm uygulama için ErrorBoundary */}
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/chat" component={Chat} />
          <Route path="/videocall" component={VideoCall} />
        </Switch>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
