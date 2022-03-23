import React, {useState, useEffect, useContext, useRef} from 'react';
import DatePicker from "react-datepicker";
import { useHistory, useParams } from 'react-router';
import {GlobalContext} from "../../context/ProjectContext"
import Select from "react-select"
import Creatable from "react-select/creatable"
import { setFeeds } from '../../reducer/common';
import "react-datepicker/dist/react-datepicker.css";
import FadeLoader from 'react-spinners/FadeLoader'
import {Modal,
  ModalBody,ModalHeader,ModalFooter,Button} from 'reactstrap'


const CreateParcel = () => {
  const getExpectedDate = () => {
    var d = new Date();
    const c = parseInt(process.env.REACT_APP_EXPECTED_DATE)
    d.setDate(d.getDate() + c);
    return d
  }

  const {authenticateUser, setAlertData} = useContext(GlobalContext);
  
  const [parcelData, setParcelData] = useState({
      SenderName:"", SenderNumber:"", BookedFrom:authenticateUser.branch.id, RecieverName:"", RecieverNumber:"",
      SendTo:"", ProductType:"Parcel", TotalCost:0, PaidAmount:0, PayableAmount: 0, expectedDate: getExpectedDate(),
      status: "Booked", Fee:0, onCondition:0, SearchId:""
  })
  const [branch, setBranch] = useState([])
  const [isNewProduct, setIsNewProduct] = useState(false)
  const [allProduct, setAllProduct] = useState([])
  const [b_value, setBValue] = useState(null)
  const [p_value, setPValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feePaid,setFeePaid] = useState(false)
  const history = useHistory()
   //console.log(getExpectedDate(), new Date());

  useEffect(() => {
      getSearchID()
  }, [])

  const getBranchName = async() => {
    const res = await fetch(`${process.env.REACT_APP_HOST_NAME}branchApi/getBranch`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }) 
    const temp = await res.json()
    
    let test = [];
    test = temp.filter((branch, key) => (branch._id !== authenticateUser.branch.id)).map(branch => ({value:branch._id, label:branch.branch}))
    setBranch(test)

    const product_res = await fetch(`${process.env.REACT_APP_HOST_NAME}getType`, {
      method: "GET",
      headers: {
          "Content-Type": "application/json"
      }
    }) 
    const product_temp = await product_res.json()
    let new_test = [];
    //new_test = product_temp.map(prpoduct => ({value:prpoduct, label:prpoduct}))
    new_test = product_temp.filter(product => product !== "Parcel").map(prpoduct => ({value:prpoduct, label:prpoduct}))
    new_test.unshift({value:"Parcel", label:"Parcel"})
    //test = temp.filter((branch, key) => (branch._id !== authenticateUser.branch.id)).map(branch => ({value:branch._id, label:branch.branch}))
    setAllProduct(new_test)
  }


  useEffect(() => {
    let amount = parseInt(parcelData.Fee) + parseInt(parcelData.onCondition)
    amount > -1 && setParcelData(parcelData => ({...parcelData, TotalCost:amount}))
  },[parcelData.Fee, parcelData.onCondition])

  // useEffect(() => {
  //   let amount = parseInt(parcelData.Fee)
  //   amount > -1 && setParcelData(parcelData => ({...parcelData, PayableAmount:amount}))
  // }, [parcelData.Fee])

  useEffect(() => {
    setParcelData(parcelData => ({...parcelData, BookedFrom:authenticateUser.branch.id, expectedDate: getExpectedDate()}))
    authenticateUser.branch.id && getBranchName()
  }, [authenticateUser.branch.id])

 
  
  
  const getSearchID = async() => {
    const res_id = await fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/generateId`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    const temp_id =await res_id.json()
    setParcelData({...parcelData, SearchId:temp_id.searchId, status: "Booked", expectedDate: getExpectedDate()})
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

    const changeParcelData = (event) => {
        setParcelData({...parcelData, [event.target.name]:event.target.value})
    }
    

    const handleCreateParcel = async(event) => {
      
        event.preventDefault()
        
        for (const [key, value] of Object.entries(parcelData)) {
          if(key === "PaidAmount" || key === "PayableAmount" || key == "onCondition")
            continue
          if(value === "" || value === 0){
            setAlertData({message: `Field ${key} is empty`, code: "danger"})
            return
          }
        }

        if(feePaid){
          parcelData['PayableAmount'] = 0
          parcelData["PaidAmount"] = parcelData.Fee
        } else{
          parcelData['PayableAmount'] = parcelData.Fee
          parcelData["PaidAmount"] = 0
        }
        console.log(parcelData);
        setLoading(true)
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/parcel/${parcelData.SendTo}/${parcelData.BookedFrom}/${authenticateUser._id}`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              ...parcelData
          })
        })
        const temp = await res.json()
       
        if(res.status === 200){
          setFeePaid(false)
          setBValue(null)
          setPValue(null)
          const test = {SearchId:temp.SearchId, RecieverNumber:"0" + temp.RecieverNumber, BookedFrom:temp.BookedFrom._id,
            SenderNumber:"0" + temp.SenderNumber,  SendTo:temp.SendTo._id, status:temp.status, SenderName:temp.SenderName, 
          RecieverName:temp.RecieverName}
          
          sendMessage(test)
          await getSearchID()
        
          setParcelData(parcelData => ({...parcelData,
            SenderName:"", SenderNumber:"", RecieverName:"", RecieverNumber:"", BookedFrom: authenticateUser.branch.id,
            SendTo:"", ProductType:"", TotalCost:0, PaidAmount:0, PayableAmount: 0, expectedDate: getExpectedDate(),
            Fee:0, onCondition:0
          }))

          

          const feedsData = {
            user: authenticateUser._id,
            message: `A parcel created by <b>${authenticateUser.Username}</b> with parcel id <b>${temp.SearchId}</b>`,
            branch: authenticateUser.branch.id,
            tag: "parcel"
          }
          setFeeds(feedsData)
          setAlertData({message: "Parcel Successfully Create", code: "success"})

          if(isNewProduct){
            allProduct.splice(1, 0, {value:parcelData.ProductType, label:parcelData.ProductType})
            createNewType(parcelData.ProductType)
          }
          setLoading(false)
        } else {
          setAlertData({message: temp.message, code: "danger"})
          setLoading(false)
        }
      
    }

    const sendMessage = async(p_data) => {
   
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

    // const isFeePaid = (event) => {
    //   let x = event.target.checked
    //   if(x) setParcelData({...parcelData, PaidAmount:parcelData.Fee, PayableAmount:0})
    //   else setParcelData({...parcelData, PaidAmount:0, PayableAmount:parcelData.Fee})
    // }

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
    }


    return (
        <div class="container" id="dataForm">
    
          <div className="Parcelform">
        {loading && 
            <div className="overlay">
              <FadeLoader color={"#0178bc"} loading={loading} size={50} />
            </div> }
        <form onSubmit={(e)=>handleCreateParcel(e)} autocomplete="off">
      
          
          <div class="form-group row updatefrom">
            <label for="SenderName" class="col-sm col-form-label col-form-label-sm">Sender Name:</label>
            <div class="col-sm-10">
              <input type="text" class="form-control form-control-sm inputstyle" name="SenderName" id="SenderName" placeholder="SenderName" 
              value={parcelData.SenderName} onChange={(e) => changeParcelData(e)}/>
            </div>
          </div>

          <div class="form-group row updatefrom">
              <label for="SenderNumber" class="col col-form-label col-form-label-sm">Sender Number:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control form-control-sm inputstyle" name="SenderNumber" id="SenderNumber" placeholder="SenderNumber"
                    value={parcelData.SenderNumber} onChange={(e) => changeParcelData(e)} />
              </div>
            </div>

            <div class="form-group row updatefrom">
              <label for="RecieverName" class="col-sm col-form-label col-form-label-sm">Receiver Name:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control form-control-sm inputstyle" name="RecieverName" id="RecieverName" placeholder="Reciever Name"
                value={parcelData.RecieverName} onChange={(e) => changeParcelData(e)}/>
              </div>
            </div>
            <div class="form-group row updatefrom">
              <label for="RecieverNumber" class="col-sm col-form-label col-form-label-sm">Receiver Number:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control form-control-sm inputstyle" name="RecieverNumber" id="RecieverNumber" placeholder="Reciever Number"
                value={parcelData.RecieverNumber} onChange={(e) => changeParcelData(e)} />
              </div>
            </div>

  
            <div class="form-group row updatefrom">
              <label for="select" class="col-sm col-form-label col-form-label-sm">Sent To:</label>
              <div class="col-sm-10">
                <Select className="PfromSelect" id="PfromSelectID" value={b_value}
                  defaultValue={branch[0]}  options={branch} placeholder="Select Branch"
                  onChange={ (selectedBranch) =>  {
                    setParcelData({...parcelData, SendTo:selectedBranch.value})
                    setBValue(selectedBranch)
                    }}
                  isLoading={branch.length ? false : true}/>
             
                </div>
            </div>


            <div class="form-group row updatefrom">
              <label for="" class="col-sm col-form-label col-form-label-sm">Product Type:</label>
              <div class="col-sm-10">
                <Creatable  className="PfromSelect" id="ProductTypeid"
                  defaultValue={[{value:"Parcel", label:"Parcel"}]}
                  options={allProduct} placeholder="Choose/Enter Product Type"
                  onChange={ (selectedBranch) =>  {
                    handleProductType(selectedBranch)
                    setPValue(selectedBranch)
                    }}
                  isLoading={allProduct.length ? false : true}
                  />
              </div>
            </div>

            <div class="form-group row updatefrom">
              <label for="Fee" class="col-sm col-form-label col-form-label-sm">Fee Amount:</label>
              <div class="col-sm-10">
                <div className="FeePaid">
                <input type="number" class="form-control form-control-sm inputstyle" name="Fee" id="Fee" placeholder="PaidAmount"
                value={parcelData.Fee} onChange={(e) => changeParcelData(e)}/>
                <label class="form-check-label" >Fee Paid
                  <input type="checkbox" class="form-check-input" value="paid" id="isFeePaid" checked={feePaid}
                    onChange={(e) => setFeePaid(e.target.checked)}/>
              </label>
                </div>
                
              </div>
            </div>

            <div class="form-group row updatefrom">
              <label for="onCondition" class="col-sm col-form-label col-form-label-sm">On Condition:</label>
              <div class="col-sm-10">
                <input type="number" class="form-control form-control-sm inputstyle" name="onCondition" id="onCondition" placeholder="PaidAmount"
                value={parcelData.onCondition} onChange={(e) => changeParcelData(e)}/>
              </div>
            </div>
          
            <div class="form-group row updatefrom">
              <label for="TotalCost" class="col-sm col-form-label col-form-label-sm">TotalCost:</label>
              <div class="col-sm-10">
                <input type="number" readOnly={true} class="form-control form-control-sm inputstyle" name="TotalCost" id="TotalCost" placeholder="TotalCost"
                value={parcelData.TotalCost}/>
              </div>
            </div>

            <div class="form-group row updatefrom">
              <label for="Deliveyinput" class="col-sm col-form-label col-form-label-sm">Delivery Date:</label>
              <div class="col-sm-10">
              <DatePicker className="" selected={parcelData.expectedDate} onChange={(date) => setParcelData(parcelData => ({...parcelData, expectedDate:date}))} id="Deliveyinput"/>
              </div>
            </div>
            
            <div class="form-group row updatefrom frombtn">
              <button type="button my-2" class="btn btn-outline-secondary" onClick={() => history.push("/dashboard")}>Back</button>
              <button type="submit" class="btn" id="Createbtn">Create</button>
            </div>
        
        </form>
        </div> 
          </div>
        
    );
}

export default CreateParcel;
