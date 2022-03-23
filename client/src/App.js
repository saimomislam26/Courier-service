import React, {useContext} from 'react'
import indexRoutes from './routes';
import {  Route, Switch } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom'
import ParcelTrack from './views/ui-components/parcel_track';

import { LoginPrivateRoute } from './routes/auth-route';
import Login from './authentication/Login';
import { GlobalContext } from './context/ProjectContext';

const App = () => {
    
   
    return (
    <BrowserRouter>
            <Switch>
                <Route exact path="/track-parcel" component={ParcelTrack}/>
                <LoginPrivateRoute exact path="/(login|loggedin)" component={Login}/>
                {indexRoutes.map((prop, key) => {
                    return <Route path={prop.path} key={key} component={prop.component} />;
                })}
                
            </Switch>
        </BrowserRouter>
        
    )
}

export default App