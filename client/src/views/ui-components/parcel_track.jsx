import { includes } from 'lodash'
import React, {useState, useEffect, useContext} from 'react'
import {useParams} from "react-router"
import { ProgressBar, Step } from "react-step-progress-bar";
import { GlobalContext } from '../../context/ProjectContext';
import Notification from './Notification';
import Header from '../../layouts/layout-components/header/header';
import "react-step-progress-bar/styles.css";

function ParcelTrack() {
    const [pid, setPid] = useState()
    const [parcel, setParcel] = useState()
    const [text, setText] = useState()
    const {setAlertData} = useContext(GlobalContext)

    const searchProduct = async() => {
        let id = document.getElementById("pid").value
        let res = await fetch(`${process.env.REACT_APP_HOST_NAME}parcelTrack?id=${id}`, {
            method: "GET",
            headers:{
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        
        let temp = await res.json()
        console.log(temp);
        if(res.status === 400)
          setAlertData({message:"No Parcel Found", code:"danger"})
        else {
          setPid(temp.parcentage)
          setParcel(temp.parcel)

          let x = temp.parcentage === "25" ? `Your product is in <b>${temp.parcel.BookedFrom.branch}</b> warehouse` : 
                  temp.parcentage === "50" ? `Your Product is in the way of <b>${temp.parcel.SendTo.branch}</b> destination` :
                  temp.parcentage === "75" ? `You Product is in <b>${temp.parcel.SendTo.branch}</b> warehouse and ready to delivered` : 
                  temp.parcentage === "100" ? `Your Product is delivered to <b>${temp.parcel.RecieverName}</b>` : null
          setText(x)
        }
    }
    console.log(pid)
 
    return (
        <div>
          <Header />
          <Notification/>
          <div>
            <h4 style={{textAlign:'center',marginTop: '4rem',color:'#03045e'}}>Track your parcel</h4>
            <div className="ml-auto form-between col col-md-6 col-sm-12"id="ProdactSearchDiv"> 
                <li className="list-inline-item Productbox">
                    <input className="input form-control" placeholder="Search By product ID" id="pid" name="pid"/>
                </li>

                <li className="list-inline-item ml-3 Productbox" style={{display:'content'}}>
                    <button className="btn btn-info" onClick={() => searchProduct()}>Track</button>
                </li>
            </div>
          </div>

          <p style={{textAlign: 'center'}} dangerouslySetInnerHTML={{__html: text}} ></p>

          {pid && <div className="custom_progress">   
            <ProgressBar
                percent={pid}
                filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
              >
                <Step transition="scale">
                  {({ accomplished }) => (
                    <div> <p className="p-2">Booked</p>
                      {accomplished && <i class="fas fa-check-circle" style={{color:"green"}}></i>}
                    </div>
                  )}
                </Step>

                <Step transition="scale">
                  {({ accomplished }) => (
                    <div> <p>Sent</p>
                      {accomplished && <i class="fas fa-check-circle" style={{color:"green"}}></i>}
                    </div>
                  )}
                </Step>

                <Step transition="scale">
                  {({ accomplished }) => (
                    <div> <p>Recieved</p>
                    {accomplished && <i class="fas fa-check-circle" style={{color:"green"}}></i>}
                    </div>
                  )}
                </Step>

                <Step transition="scale">
                
                  {({ accomplished }) => (
                    <div> <p>Delivered</p>
                      {accomplished && <i class="fas fa-check-circle" style={{color:"green"}}></i>}
                    </div>
                  )}
                </Step>

            </ProgressBar>
            
              </div>}
       
        </div>
    )
}

export default ParcelTrack
