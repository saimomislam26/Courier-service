import React, {useContext, useEffect} from "react";
import {Route, Redirect} from "react-router-dom";
import { GlobalContext } from "../../context/ProjectContext";
import Cookies from 'js-cookie'

const PrivateRoute = ({component: Component, ...rest}) => {
    

    const {auth} = useContext(GlobalContext)
    
    return (
    <div>
        <Route {...rest} render={
            props => {
                if (auth.isLoading){
                    return <h2>Loading..</h2>
                }else if(!auth.isAuthenticated){
                    return <Redirect to="/login"/>
                }else{
                    return <Component {...props}/>
                }
            }
        }/>
    </div>
    )
}

export default PrivateRoute