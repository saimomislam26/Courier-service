import React, {useState, useEffect, useContext} from 'react';
import Employee from "./Employee"
import Admin from './Admin';
import SuperAdmin from "./SuperAdmin"
import BeatLoader from 'react-spinners/BeatLoader'

import { GlobalContext } from '../../context/ProjectContext';

const Starter = () => {
    const {authenticateUser} = useContext(GlobalContext)
  
    return (
        <div>
            { authenticateUser.Email ? authenticateUser.IsAdmin ? <Admin/> : authenticateUser.IsSuperadmin ? <SuperAdmin/> : <Employee/> : 
            <div className="show-pic"><BeatLoader color={"#0178bc"} loading={true} size={50} /></div>}
            
        </div>
    );
}

export default Starter;
