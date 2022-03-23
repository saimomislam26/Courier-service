import React, {useContext, useEffect} from "react";
import {Route, Redirect} from "react-router-dom";
import {GlobalContext} from '../../context/ProjectContext';
import Cookies from "js-cookie";

const LoginPrivateRoute = ({component: Component, ...rest}) => {
    const {auth, loginRedirect} = useContext(GlobalContext)
    
    console.log("login")

    console.log(auth.isAuthenticated, "222222222222222")

    return (
    <div>
        <Route {...rest} render={
            props => {
                if (auth.isLoading){
                    return <h2>Loading..</h2>
                }else if(auth.isAuthenticated){
                    return <Redirect to="/"/>
                }else{
                    return <Component {...props}/>
                }
            }
        }/>
    </div>
    )
}

export default LoginPrivateRoute