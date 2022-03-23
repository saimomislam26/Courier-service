import React, {useReducer, createContext, useEffect} from 'react'
import { reducer } from '../reducer/reducer'
import App from "../App"
import Cookies from 'js-cookie'

export const GlobalContext = createContext()


// let initialState = {
//         Email:"",
//         IsAdmin:Boolean,
//         IsSuperadmin:Boolean,
//         branch:{
//             branch:"",
//             contact:"",
//             id:""
//         }
// }

let initialState = {
    authenticateUser: {
        _id:"",
        Username:"",
        Email:"",
        IsAdmin:Boolean,
        IsSuperadmin:Boolean,
        Section:"",
        branch:{
            branch:"",
            contact:"",
            id:""
        }
    },
    auth: {
        isAuthenticated: Cookies.get('jwtoken') ? true : false,
        isLoading: false,
    },
    notification: {
        message:"",
        code:""
    }
}

const ProjectContext = () => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const storeLoginData =(data)=>{
        return dispatch({
            type:'LOGIN_INFO',
            payload:data
        })
    }

    const makeLoading = (status) => {
       
        return dispatch({
            type:"LOADING_STATUS",
            payload: status
        })
    }

    const setAlertData = (data) => {
        return dispatch({
            type: 'NOTIFICATION ADD',
            payload: data
        })
    }

    const clearAlertData = () => {
        return dispatch({
            type: 'NOTIFICATION CLEAR',
        })
    }
    
    const updateUser =(data)=>{
        return dispatch({
            type: 'UPDATE_USER',
            payload:data
        })
    }

    const loginRedirect = async() => {
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}authentication`, {
            method: "GET",
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include'
        })
        const temp = await res.json()
        console.log(temp);
        if (res.status === 200 && temp) {
            
            return dispatch({
                type:'CHECK_LOGIN',
                payload:temp
            })
        }
        
    }

    const logOutUser = () => {
        return dispatch({
            type:'LOGOUT_USER',
        })
    }
    
    
    useEffect(() => {
        if(Cookies.get('jwtoken')){
            loginRedirect()
        }
    },[])
    
    
    return (
        <GlobalContext.Provider value={{...state,storeLoginData,setAlertData, clearAlertData,updateUser, loginRedirect,
        logOutUser, makeLoading}}>
            <App/>
        </GlobalContext.Provider>
    )
}

export default ProjectContext
