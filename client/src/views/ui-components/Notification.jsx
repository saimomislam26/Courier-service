import React, {useState, useEffect, useContext, useRef} from 'react';
import { Alert } from 'reactstrap';
import {GlobalContext} from "../../context/ProjectContext"

const Notification = (props) => {
    const loaded = useRef(false)
    const [msgStatus, setMsgStatus] = useState(false)
    const [msg, setMsg] = useState("")
    const [status, setStatus] = useState("info")
    const {notification, clearAlertData} = useContext(GlobalContext)


    useEffect(() => {
        if (loaded.current) {
            if (notification.message) {
                setMsg(notification.message)
                setStatus(notification.code)
                setMsgStatus(true)
                const timer = setInterval(() => {setMsgStatus(false)
                    clearAlertData()}, 5000)
                return () => clearInterval(timer)
            } else{
                setMsgStatus(false)
            }
        } else{
            loaded.current = true
        }
    }, [notification.message])


 

    return(
        <div className={props.style}>
            <Alert color={status} isOpen={msgStatus} toggle={() => setMsgStatus(false)}  id="AlertBox">
                    {msg}
              </Alert>
        </div>
    )
}

export default Notification