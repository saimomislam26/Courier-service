import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
    Card, Badge,
    CardBody,
    CardTitle,
    Button
} from 'reactstrap';
import moment from 'moment'
import $ from 'jquery'
import 'bootstrap';
import {GlobalContext} from "../../../context/ProjectContext"
import BeatLoader from 'react-spinners/BeatLoader'
import { setFeeds } from '../../../reducer/common';
import _ from "lodash"

const ListComponent = (props) => {
    const loaded = useRef(false)
    const [parcels, setParcel] = useState([])
    const [searchResult, setSearchResult] = useState()
    const [parcel_id, setOTP] = useState({})
    const [flag_OTP,setFlagOTP] = useState(0)
    const {authenticateUser, setAlertData, auth} = useContext(GlobalContext);
    const history = useHistory()

  
    useEffect(() => {
        props.parcel.results && setParcel(props.parcel.results)
    },[props.parcel])


    const sendMessage = async(data) => {
        console.log(data);
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}textApi/userMessage`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              ...data
          })
        })
        const temp = await res.json()
        // if(res.status !== 200)
        //   setAlertData({message: temp.message, code: "danger"})
      }


    const chageParcelStatus = async (parcel, otp="0") => {
    
        let tag = ""
        
        if(parcel.status === "Booked"){
            tag = "Sent"
        }
        else if(parcel.status === "Sent"){
            tag = "Recieved"
        }
        else if(parcel.status === "Recieved"){
            tag = "Delivered"
        }
        
        const data = {status:tag, RecieverNumber:parcel.RecieverNumber, SenderNumber:parcel.SenderNumber}

        const normal_api = `${process.env.REACT_APP_HOST_NAME}parcelApi/updateParcel/${parcel._id}?OTP=${otp}`
        const status_recieved_api = `${process.env.REACT_APP_HOST_NAME}parcelApi/recreateParcel/newUpdate/${parcel._id}`

        const res = await fetch(tag === "Delivered" ? normal_api : status_recieved_api, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...data
        })
        })
        const temp1 = await res.json()
        if(res.status === 200){
            temp1.RecieverNumber = "0" + temp1.RecieverNumber
            temp1.SenderNumber = "0" + temp1.SenderNumber
            console.log(temp1);
            sendMessage(temp1)
            const feedsData = {
                user: authenticateUser._id,
                message: `Status of product id <b>${parcel.SearchId}</b> has been changed to <b>${tag}</b> by <b>${authenticateUser.Username}</b>`,
                branch: authenticateUser.branch.id,
                tag: "parcel"
            }
            setFeeds(feedsData)
            otp !== 0 && document.getElementById("modal-close").click()
            setAlertData({message: "Parcel Status updated", code: "success"})
            let temp = parcels
            temp = temp.filter(i => i._id !== parcel._id)
            setParcel(temp)
            
        } else {
            setAlertData({message: temp1.message, code: "danger"})
        }   
    }

    const statusShow = (status) =>{
        let tag = "info";
        if(status === "Booked"){
            tag = "info"
        }
        else if(status === "Sent"){
            tag = "primary"
        }
        else if(status === "Recieved"){
            tag = "warning"
        }
        else if(status === "Delivered"){
            tag = "success"
        }
        return (
            <td><span className={`badge badge-light-${tag} text-${tag}`}>{status}</span></td>
        )
    }

    useEffect(() => {
        if(props.search){
            let temp = parcels
            temp = temp.filter(i => i.SearchId === props.search)
            setSearchResult(temp)
        }
    }, [props.search])

    const showProductDetails = (id, uid) => { 
        history.push({
            pathname: `/product-details/${uid}`,
        })
    }


    const searchResultpage = () => {
        return (
            <>
            {searchResult.map((res, key) => 
            <tr key={key}>                            
                <td className="t-click" onClick={(e) => {showProductDetails(res._id, res.SearchId)}}>
                
                    <Badge href="" color="primary">
                        <h6 className=" mb-0 nowrap">{res.SearchId}</h6>
                    </Badge>
                    
                </td>
                <td>{res.SendTo.branch}</td>
                <td><h6 className="mb-0 nowrap">{res.ProductType}</h6></td>
                <td>{moment(res.createdAt).format('DD MMM, YYYY')}</td>
                <td><span 
                className={`badge badge-light-${res.PayableAmount===0?"success":"danger"} text-${res.PayableAmount===0?"success":"danger"}`}>
                    {res.PayableAmount}</span></td>
                
                <td className="badge badge-light-success text-success m-3">
                {res.PaidAmount}</td>
                {props.nav ? statusShow(res.status) :  props.dataStatus === "Sent" || props.dataStatus === "Delivered" ? null :<td>
                    <Button className=" btn btn-sm" color="danger" onClick={() => chageParcelStatus(res)}>
                        Change Status
                    </Button>
                </td> }
                           
            </tr>)}
            </>
        )
    }

    const checkUserOTP = async(event) => {
        
        event.preventDefault()
        let otp = document.getElementById("otp").value
        if(otp) chageParcelStatus(parcel_id, otp)
        else setAlertData({message:"Please provide a valide OTP", code:"danger"})
        
    }

    const addOTP = () => {
        return(<>
        
            <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLongTitle">Check OTP</h5>
                        <button type="button" id="modal-close" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form onSubmit={(event) => checkUserOTP(event)}>
                        <div class="modal-body">
                            <li className="list-inline-item">
                                <input className="input form-control" id="otp" placeholder="Enter your six digit code"
                                 name="branch" autoFocus autoComplete="off" onChange={(e) => {
                                     let element = document.getElementById("check-otp-btn")
                                        if(!e.target.value){
                                            element.disabled = true
                                        } else {
                                            element.disabled = false
                                        }
                                    }}
                                />
                            </li>
                            <li className="list-inline-item">
                            <button type="button" class="btn btn-primary" onClick={() => otpCreate()}
                                style={{background: "#0190c6"}}>{parcel_id.OTP ? "Resend" : "Send"} OTP</button>
                            </li>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary" disabled={true} style={{background: "#0190c6"}}
                                    id="check-otp-btn"
                                    >Check OTP</button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </>)
    }
    
    const otpCreate = async() => {
            console.log(flag_OTP);
            console.log("Otp creating", parcel_id);
            if(flag_OTP===0){
                const res = await fetch(`${process.env.REACT_APP_HOST_NAME}sendOTP/${parcel_id._id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        RecieverNumber:"0"+parcel_id.RecieverNumber
                    })
                  })
                  const temp = await res.json()
                
                  if(res.status === 200){
                    setAlertData({message: "OTP Successfully Send", code: "success"})
                    setOTP({...parcel_id, OTP:"0000"})
                    setFlagOTP(1)
                  }  else {
                    setAlertData({message: temp.message, code: "danger"})
                  } 
            
            }
            
        
    }

    useEffect(() => {  
        if (loaded.current){
            if(!parcel_id.OTP || document.getElementById("otp-btn").innerText === "Send OTP"){
                otpCreate()
            }
        }
        else loaded.current = true
    }, [parcel_id])

    console.log(process.env.REACT_APP_OTP, parcels);
    
    return (
        props.loading ? (<div className="show-pic"><BeatLoader color={"#0178bc"} loading={props.loading} size={50} /></div>):(
        <div>
            <Card>
            <CardBody>
                <div className="d-md-flex no-block">
                </div>
                {addOTP()}
                <div className="table-responsive mt-2">
                    <table className="table stylish-table mb-0 mt-2 no-wrap v-middle">
                        <thead>
                            <tr>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Product ID</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Sent To</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Product Type</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Reservation Day</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Payable Amount</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Paid Amount</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom Receiver" style={{textAlign: 'center'}}> Status</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                        
                            { searchResult ? searchResultpage() :
                            parcels.map((parcel, key) =>
                                <tr key={key}>
                                    
                                    <td className="t-click" onClick={(e) => {showProductDetails(parcel._id, parcel.SearchId)}}>
                                     
                                        <a href="" class="myButtonID">
                                            {parcel.SearchId}
                                        </a>
                                        
                                    </td>
                                    <td>{parcel.SendTo.branch}</td>
                                    <td>{parcel.ProductType}</td>
                                    <td>{moment(parcel.createdAt).format('DD MMM, YYYY')}</td>
                                    <td><span 
                                    className={`-${parcel.PayableAmount===0?"success":""} -${parcel.PayableAmount===0?"success":""}`}>
                                        {parcel.PayableAmount}</span></td>
                                    
                                    <td>
                                    {parcel.PaidAmount}</td>
                                    {props.nav ? statusShow(parcel.status) :  props.dataStatus === "Sent" || props.dataStatus === "Delivered" ? statusShow(parcel.status) : 
                                        parcel.status === "Recieved" ?<td>
                                            {/* -------------------------------------------------------------------------------- */}
                                        <Button type="button" id="otp-btn" className="btn myButtonCS" onClick={(e) => {
                                                                if(process.env.REACT_APP_OTP === "TRUE"){
                                                                    setOTP(parcel)
                                                                    // flag = 1
                                                                    // console.log(flag);
                                                                    e.target.innerText = "Check OTP"
                                                                } else{
                                                                    chageParcelStatus(parcel)
                                                                }
                                                            }}
                                            data-toggle={process.env.REACT_APP_OTP === "TRUE" && "modal"} 
                                            data-target={process.env.REACT_APP_OTP === "TRUE" && "#exampleModalCenter"}>
                                                 {parcel.OTP ? "Check OTP" : "Send OTP"}</Button> </td> :
                                                 
                                            <td>
                                                <Button type="button" className="btn myButtonCS"  onClick={() => chageParcelStatus(parcel)} 
                                                            >
                                                    Change Status to {parcel.status === "Booked" ? "Sent" : parcel.status === "Sent" ? "Recieved" : "Delivered"}
                                                </Button>
                                       
                                            </td> }
                           
                                </tr>
                            )}
                            
                            
                        </tbody>
                    </table>
                </div>
            </CardBody>
        </Card>
            {/* -------------------------------------------------------------------------------- */}
            {/* Row */}
            {/* -------------------------------------------------------------------------------- */}
        </div>
        )
    );
}

export default ListComponent;
