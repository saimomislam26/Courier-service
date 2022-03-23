import React, {useState, useEffect, useContext, useRef} from 'react';
import DatePicker from "react-datepicker";
import { useHistory, useParams } from 'react-router';
import {GlobalContext} from "../../context/ProjectContext"
import { setFeeds } from '../../reducer/common';
import Select from 'react-select';
import BeatLoader from 'react-spinners/BeatLoader'
import Creatable from "react-select/creatable"
import "react-datepicker/dist/react-datepicker.css";


const UpdateProduct = () => {
  const {authenticateUser, setAlertData} = useContext(GlobalContext);
  const [loading, setLoading] = useState(true)
  const [parcelData, setParcelData] = useState({
      SenderName:"", SenderNumber:"", BookedFrom:authenticateUser.branch.id, RecieverName:"", RecieverNumber:"",
      SendTo:"", ProductType:"", TotalCost:null, PaidAmount:null, PayableAmount: null, expectedDate: new Date(),
      status: "", SearchId: "", _id:"", Fee:0, onCondition:0
  })
    const [defaultBranch, setDefaultBranch] = useState([])
    const [allProduct, setAllProduct] = useState([])
    const [isNewProduct, setIsNewProduct] = useState(false)
    const [initProduct, setInitProduct] = useState()
    const [branch, setBranch] = useState([])
    const history = useHistory()
    const {pid} = useParams()

    useEffect(() => {
      setLoading(true)
      getBranchName()
        fetch(`${process.env.REACT_APP_HOST_NAME}parcelTrack?id=${pid}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
              let i = {}
              for (const [key, value] of Object.entries(parcelData)){
                if(key === "BookedFrom" || key === "SendTo")
                  i[key] = data.parcel[key]._id
                else i[key] = data.parcel[key]
              }
              setInitProduct(i)
              setParcelData(i)
              setLoading(false)
            })
      }, [])

      useEffect(() => {
        let amount = parseInt(parcelData.Fee) + parseInt(parcelData.onCondition)
        amount > -1 && setParcelData(parcelData => ({...parcelData, TotalCost:amount, PayableAmount:parcelData.Fee}))
      },[parcelData.Fee, parcelData.onCondition])
    
      useEffect(() => {
        let amount = parseInt(parcelData.Fee) - parseInt(parcelData.PaidAmount)
        amount > -1 && setParcelData(parcelData => ({...parcelData, PayableAmount:amount}))
      }, [parcelData.PaidAmount])

      
        const getBranchName = async() => {
            const res = await fetch(`${process.env.REACT_APP_HOST_NAME}branchApi/getBranch`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }) 
            const temp = await res.json()
            let test = [];
            test = temp.map((branch, key) => ({value:branch._id, label:branch.branch}))
            setBranch(test)

            const product_res = await fetch(`${process.env.REACT_APP_HOST_NAME}getType`, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json"
              }
            }) 
            const product_temp = await product_res.json()
            let new_test = [];
            new_test = product_temp.map(prpoduct => ({value:prpoduct, label:prpoduct}))
            
            setAllProduct(new_test)
        }
        
    
    const changeParcelData = (event) => {
        setParcelData({...parcelData, [event.target.name]:event.target.value})
    }


    useEffect(() => {
      let x = []
      branch.filter(i => {
        if(i.value === parcelData.SendTo)
          x[0] = i
        else if(i.value === parcelData.BookedFrom)
          x[1] = i
        
        return i
      })
      setDefaultBranch(x)
    }, [parcelData])
    //console.log(parcelData);

    const handleUpdateParcel = async(event) => {
      event.preventDefault()
      for (const [key, value] of Object.entries(parcelData)) {
        if(key === "PaidAmount" || key === "PayableAmount")
          continue
        if(value === "" || value === 0){
          setAlertData({message: `Field ${key} is empty`, code: "danger"})
          return
        }
      }
      if((initProduct.SendTo !== parcelData.SendTo) && (parcelData.status === "Recieved")){
      
        initProduct.status = "Delivered"
        if(initProduct.PayableAmount === 0){
          parcelData.Fee = 0
          parcelData.PaidAmount = 0
        }
        parcelData.BookedFrom = initProduct.SendTo
        
        updateParcelAPI(initProduct) 
        createNewParcel(parcelData)
      } else {
        console.log("Else");
        console.log(parcelData);
        updateParcelAPI(parcelData)
      } 
    }
    
    const updateParcelAPI = async(data) => {
        let res = await fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/recreateParcel/newUpdate/${parcelData._id}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...data
        })
      })
      let temp = await res.json()
      
      if(res.status === 200){
        const feedsData = {
          user: authenticateUser._id,
          message: `<b>${temp.SearchId}</b> parcel has been updated by <b>${authenticateUser.Email}</b>`,
          branch: authenticateUser.branch.id,
          tag: "parcel"
        }

        setFeeds(feedsData)
        setAlertData({message:"Parcel Update Successfully", code:"success"})
        if(isNewProduct){
          allProduct.unshift({value:parcelData.ProductType, label:parcelData.ProductType})
          createNewType(parcelData.ProductType)
        }
        history.goBack()
      } else setAlertData({message: temp.message, code:"danger"})
    }

    const getExpectedDate = () => {
      var d = new Date();
      d.setDate(d.getDate() + parseInt(process.env.REACT_APP_EXPECTED_DATE));
      return d
    }

    const getSearchID = async() => {
      const res_id = await fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/generateId`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      const temp_id =await res_id.json()
      return temp_id.searchId
    }

    // const getSearchID = async(id) => {
    //   console.log(id);
    //   const res_id = await fetch(`${process.env.REACT_APP_HOST_NAME}Count/postCount/number/618653ce2e49f863343b5157`, {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //       count:id
    //     })
    //   })
    //   const temp_id =await res_id.json()
    //   console.log(temp_id);
    //   setParcelData({...parcelData, status: "Booked", expectedDate: new Date()})
    // }
    
    const sendMessage = async(p_data) => {
      console.log(p_data);
      const res = await fetch(`${process.env.REACT_APP_HOST_NAME}textApi/userMessage`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...p_data
        })
      })
      const temp = await res.json()
      // if(res.status !== 200)
      //   setAlertData({message: temp.message, code: "danger"})
    }

    const createNewParcel = async(parcel) => {
      let search_id =  await getSearchID()
     
      let data = {
        SenderName:parcel.SenderName, SenderNumber:parcel.SenderNumber, BookedFrom:parcel.BookedFrom, 
        SendTo:parcel.SendTo, RecieverName:parcel.RecieverName, RecieverNumber:parcel.RecieverNumber,
        ProductType:parcel.ProductType, TotalCost:parcel.TotalCost,
        PaidAmount:parcel.PaidAmount, PayableAmount: parcel.PayableAmount,
        expectedDate: getExpectedDate(), referance: parcel.SearchId, SearchId: search_id,
        status: "Booked", Fee:parcel.Fee, onCondition:parcel.onCondition
    }
    console.log(data);
  
      const res = await fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/parcel/${parcel.SendTo}/${parcel.BookedFrom}/${authenticateUser._id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...data
        })
      })
      const temp = await res.json()
      if(res.status === 200){
        const test = {SearchId:temp.SearchId, RecieverNumber:"0" + temp.RecieverNumber, BookedFrom:temp.BookedFrom._id,
                      SenderNumber:"0" + temp.SenderNumber,  SendTo:temp.SendTo._id, status:temp.status, SenderName:temp.SenderName, 
                      RecieverName:temp.RecieverName, referance: temp.referance}
        
        await sendMessage(test)
       
        console.log("parcel create", temp);
      }
    
    }

    const handleProductType = async(selectedBranch) => {
      setParcelData({...parcelData, ProductType:selectedBranch.label})
      if(selectedBranch.__isNew__){
        setIsNewProduct(true)
      }
    }

    const createNewType = async(label) => {
      const res = await fetch(`${process.env.REACT_APP_HOST_NAME}typeApi/saveProductType`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productType:label
        })
      })
      const temp = await res.json()
      console.log(res, temp);
    }

    const isFeePaid = (event) => {
      let x = event.target.checked
      if(x) setParcelData({...parcelData, PaidAmount:parcelData.Fee})
      else setParcelData({...parcelData, PaidAmount:0})
    }

    console.log(parcelData);
    return (
        <div class="container" id="dataForm">
          <div className="Parcelform">
          {loading ? <div className="show-pic"><BeatLoader color={"#0178bc"} loading={loading} size={50} /></div> :
        <form onSubmit={(e)=>handleUpdateParcel(e)}>

        <div class="form-group row updatefrom">
            <label for="SearchId" class="col-sm-2 col-form-label col-form-label-sm">ID:</label>
            <div class="col-sm-10">
              <input type="text" class="form-control form-control-sm inputstyle" name="SearchId" id="SearchId" placeholder="SenderName" 
              value={parcelData.SearchId} disabled/>
            </div>
          </div>

          <div class="form-group row updatefrom">
            <label for="SenderName" class="col-sm-2 col-form-label col-form-label-sm">Sender Name:</label>
            <div class="col-sm-10">
              <input type="text" class="form-control form-control-sm inputstyle" name="SenderName" id="SenderName" placeholder="SenderName" 
              value={parcelData.SenderName} onChange={(e) => changeParcelData(e)}/>
            </div>
          </div>
          <div class="form-group row updatefrom">
              <label for="SenderNumber" class="col-sm-2 col-form-label col-form-label-sm">Sender Number:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control form-control-sm inputstyle" name="SenderNumber" id="SenderNumber" placeholder="SenderNumber"
                    value={parcelData.SenderNumber} onChange={(e) => changeParcelData(e)}/>
          </div>
          </div>
          <div className="form-group row updatefrom">
              <label for="Uselectstyle" class="col-sm-2 col-form-label col-form-label-sm">Status:</label>
              <div class="col-sm-10">
                <select className="form-select form-select-sm inputstyle" id="Uselectstyle" value={parcelData.status}
                  name="status" onChange={(e) => changeParcelData(e)}>
                    <option value="Booked">Booked</option>
                    <option value="Sent">Sent</option>
                    <option value="Recieved">Recieved</option>
                    <option value="Delivered">Delivered</option>
                </select>
              </div>
          </div>

            
            <div class="form-group row updatefrom">
              <label for="BFselect" class="col-sm-2 col-form-label col-form-label-sm">Booked From:</label>
              <div class="col-sm-10">
                {defaultBranch.length !== 0 && <Select className="PfromSelect" options={branch}
                 defaultValue={defaultBranch[1]} id="BFselect"/>}
       
              </div>
            </div>

            <div class="form-group row updatefrom">
              <label for="RecieverName" class="col-sm-2 col-form-label col-form-label-sm">Receiver Name:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control form-control-sm inputstyle" name="RecieverName" id="RecieverName" placeholder="SenderName"
                value={parcelData.RecieverName} onChange={(e) => changeParcelData(e)}/>
              </div>
            </div>
            <div class="form-group row updatefrom">
              <label for="RecieverNumber" class="col-sm-2 col-form-label col-form-label-sm">Receiver Number:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control form-control-sm inputstyle" name="RecieverNumber" id="RecieverNumber" placeholder="SenderNumber"
                value={parcelData.RecieverNumber} onChange={(e) => changeParcelData(e)}/>
              </div>
            </div>
  
  
            <div class="form-group row updatefrom">
              <label for="select" class="col-sm-2 col-form-label col-form-label-sm">Sended To:</label>
              <div class="col-sm-10">
              {defaultBranch.length !== 0 && <Select className="PfromSelect" options={branch}
                 onChange={ (selectedBranch) =>  setParcelData({...parcelData, SendTo:selectedBranch.value})}
                 defaultValue={defaultBranch[0]} id="FSelect"/>}
  
                </div>
            </div>

           

            <div class="form-group row updatefrom">
              <label for="" class="col-sm-2 col-form-label col-form-label-sm">Product Type:</label>
              {parcelData.ProductType &&  <div class="col-sm-10">
                <Creatable className="PfromSelect" options={allProduct} placeholder="Choose/Enter Product Type"
                  onChange={ (selectedBranch) =>  handleProductType(selectedBranch)}
                  defaultValue={{value:parcelData.ProductType, label:parcelData.ProductType}} id="pYinput"/>
              </div>}
            </div>



            <div class="form-group row updatefrom">
              <label for="Fee" class="col-sm-2 col-form-label col-form-label-sm">Fee Amount:</label>
              <div class="col-sm-10">
                <div className="FeePaid">
                <input type="number" class="form-control form-control-sm inputstyle" name="Fee" id="Fee" placeholder="PaidAmount"
                value={parcelData.Fee} onChange={(e) => changeParcelData(e)}/>
                 <label class="form-check-label">Fee Paid
                  <input type="checkbox" class="form-check-input" value="paid" checked={!parcelData.PayableAmount && true} id="isFeePaid"
                    onChange={(e) => isFeePaid(e)}/>
              </label>
              </div>
              </div>
            </div>

            <div class="form-group row updatefrom">
              <label for="onCondition" class="col-sm-2 col-form-label col-form-label-sm">On Condition:</label>
              <div class="col-sm-10">
                <input type="number" class="form-control form-control-sm inputstyle" name="onCondition" id="onCondition" placeholder="PaidAmount"
                value={parcelData.onCondition} onChange={(e) => changeParcelData(e)}/>
              </div>
            </div>
          
            <div class="form-group row updatefrom">
              <label for="TotalCost" class="col-sm-2 col-form-label col-form-label-sm">Total Cost:</label>
              <div class="col-sm-10">
                <input type="number" readOnly={true} class="form-control form-control-sm inputstyle" name="TotalCost" id="TotalCost" placeholder="TotalCost"
                value={parcelData.TotalCost}/>
              </div>
            </div>
       
            
{/*           
            <div class="form-group row updatefrom">
              <label for="Fee_Due" class="col-sm-2 col-form-label col-form-label-sm">Fee Due:</label>
              <div class="col-sm-10">
                <input type="number" readOnly={true} class="form-control form-control-sm inputstyle" name="PayableAmount" id="Fee_Due" placeholder="PayableAmount"
                value={parcelData.PayableAmount}/>
              </div>
            </div> */}


    
            <div class="form-group row updatefrom">
              <label for="DeliveryDate" class="col-sm-2 col-form-label col-form-label-sm">Delivery Date:</label>
              <div class="col-sm-10">
                <DatePicker selected={Date.parse(parcelData.expectedDate)} onChange={(date) => setParcelData({...parcelData, expectedDate:date})} id="DeliveryDate"/>
              </div>
            </div>
            
            <div class="form-group row updatefrom frombtn">
              <button type="button my-2" class="btn btn-outline-secondary" onClick={() => history.push("/parcel-history")}>Back</button>
              <button type="submit" class="btn" id="Createbtn">Update</button>
            </div>
        
        </form>}
        </div>
          </div>
        
    );
}

export default UpdateProduct;
