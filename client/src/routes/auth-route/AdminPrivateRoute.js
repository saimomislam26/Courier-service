import React, {useContext} from "react";
import {Route, Redirect} from "react-router-dom";
import { GlobalContext } from "../../context/ProjectContext";
import BeatLoader from 'react-spinners/BeatLoader'


const AdminPrivateRoute = ({component: Component, ...rest}) => {
    const {auth, authenticateUser} = useContext(GlobalContext)
    console.log(auth);
    return (
    <div>
        <Route {...rest} render={
            props => {
                if (!authenticateUser.Email){
                    return <div className="show-pic">
                                <BeatLoader color={"#0178bc"} loading={true} size={50} />
                            </div>
                }else if(!auth.isAuthenticated || !( authenticateUser.IsSuperadmin || authenticateUser.IsAdmin)){
                    return <Redirect to="/"/>
                }else{
                    return <Component {...props}/>
                }
            }
        }/>
    </div>
    )
}

export default AdminPrivateRoute