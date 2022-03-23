import React, {useState, useEffect, useContext} from 'react';
import {
    Row, Nav, NavItem,
    Col, CardBody, NavLink
} from 'reactstrap';
import { ListComponent } from '../../components/dashboard';
import {GlobalContext} from "../../context/ProjectContext"
import Select from 'react-select';
import DatePicker from "react-datepicker";
import Pagination from "../ui-components/page_pagination"
import _ from "lodash"
import { PAGINATION_LIMIT } from '../../reducer/common';


const Employee = () => {
    const {authenticateUser, setAlertData} = useContext(GlobalContext)
    const [sortParam, setSortParam] = useState(authenticateUser.Section === "delivery" ? 'Expected' : "Booked")
    const [parcels, setParcels] = useState({})
    const [loading, setloading] = useState(false)
    //const [parcelStatus, setParcelStatus] = useState()
    const [search, setSearch] = useState("")
    const [dateParam, setDateParam] = useState(new Date())
    const [page, setPage] = useState(1)
    const [pnumber, setPNumber] = useState(null)
    const [pid, setPid] = useState()
    const [currPage, setcurrPage] = useState(1)
    const [branch, setBranch] = useState("all")
    const [selectedBranch, setSelectedBranch] = useState("null")
    const [searchPage, setSearchPage] = useState(1)
    const [pag, setPag] = useState("main")

    const numberSearchCheck = () => {
      if(pnumber){
        if(pnumber.length >= 11){
          return sortParam === "Delivered" && pnumber
        }
      }
      return false
    }

    //console.log(pnumber ? numberSearchCheck() : true);

    useEffect(() => {
        
        let branchStatus = "bookedFrom"
        if(sortParam === "Recieved" || sortParam === "Delivered" || sortParam === "Expected"){
          branchStatus = `sendTo/${numberSearchCheck() || null}`
        }
            
       
        if(pnumber ? numberSearchCheck() : true){
          setloading(true)
          console.log(`${process.env.REACT_APP_HOST_NAME}parcelApi/branchUser/${branchStatus}/${authenticateUser.branch.id}/${sortParam}/${dateParam}/${selectedBranch}?page=${currPage}&limit=${PAGINATION_LIMIT}`);
          fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/branchUser/${branchStatus}/${authenticateUser.branch.id}/${sortParam}/${dateParam}/${selectedBranch}?page=${currPage}&limit=${PAGINATION_LIMIT}`, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json"
              }
          })
          .then(response => response.json())
          .then(data => {
              
              if(data.message){
                  setParcels({results:[]})
              } else{
                setPag("main")
                  setParcels(data)
              }
              setloading(false)
          })
      }
    },[sortParam, authenticateUser.branch.id, currPage, dateParam, selectedBranch])

    useEffect(() => {
      getBranchName()
    },[])

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
      test.unshift({value: "null", label:"All"})
      setBranch(test)
  }

    useEffect(() => {
        setcurrPage(1)
        setSearchPage(1)
    }, [sortParam, dateParam])

    
    const setPageParam = (p) => {
      //pnumber ? numberSearchCheck() && setSearchPage(p) : setcurrPage(p)
      pag == "main" ? setcurrPage(p) : setSearchPage(p)
      //(pnumber) && sortParam !== "Delivered" ? setSearchPage(p) : setcurrPage(p)
    }

    useEffect(() => {
      if(pnumber){
        if(pnumber.length < 11){
           setSearchData()      
        } else if(pnumber.length > 10 && sortParam !== "Delivered" ){
          setSearchData()
        }
      }
    }, [searchPage, sortParam])
  

  
    const setSearchData = async() => {
      console.log("search Data");
      if(pnumber){
        let paramaeter = ""
        if(pnumber.length<11){
          paramaeter = `${pnumber}/null`
        } else{
          paramaeter = `null/${pnumber}`
        }
       
          setloading(true)
          console.log(`${process.env.REACT_APP_HOST_NAME}parcelApi/see/${paramaeter}/${authenticateUser.branch.id}/${sortParam}?page=${searchPage}&limit=${PAGINATION_LIMIT}`);
          let res = await fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/see/${paramaeter}/${authenticateUser.branch.id}/${sortParam}?page=${searchPage}&limit=${PAGINATION_LIMIT}`, {
              method: "GET",
              headers:{
                  "Content-Type": "application/json"
              }
          })
          console.log(res);
          let temp = await res.json()
          if(res.status === 200)
          {
            console.log(temp);
            setPag("search")
            setParcels(temp)
            setloading(false)
          }
          else {
            setParcels({results:[]})
            setloading(false)
        }
        } 
        else {
          setAlertData({message:"Invalid Input", code:"danger"})
        }
    }

    const parcelStatus = () => {
      
        if(authenticateUser.Section === "delivery"){
        return(
            <Nav tabs style={{cursor: 'pointer'}} >
              <NavItem>
                <NavLink
                className={sortParam==="Expected" && "active"}
                  onClick={() => setSortParam("Expected")}
                >
                  To Be Recieved
                </NavLink>
            </NavItem>
              <NavItem>
                <NavLink
                className={sortParam==="Recieved" && "active"}
                  onClick={() => setSortParam("Recieved")}
                >
                  Recieved Parcel
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                className={sortParam==="Delivered" && "active"}
                  onClick={() => setSortParam("Delivered")}
                >
                  Delivered Parcel
                </NavLink>
              </NavItem>
           
          </Nav>
        )
        } else if(authenticateUser.Section === "booking"){
            return(
                <Nav tabs>
                <NavItem>
                  <NavLink
                   className={sortParam==="Booked" && "active"}
                    onClick={() => setSortParam("Booked")}
                  >
                    Booked Parcel
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                   className={sortParam==="Sent" && "active"}
                    onClick={() => setSortParam("Sent")}
                  >
                    Sent Parcel
                  </NavLink>
                </NavItem>
              </Nav>
            )
        }
    }
    
 
  
    return (
        <div>
            <Row>
                <Col sm={12}>
                <CardBody className="">
                 
                   
                    <div class="form-row" id="SearchNav">
                    {/* SearcbarDiv */}
                         <div class="form-group form-inline col-xs-12 col-sm-6 col-md-6 col-lg-8" id="">
                        
                           
                           <form onSubmit={(e) => {
                                   e.preventDefault()
                                   setSearchData()
                               }} onChange={(e) => {
                                     setPNumber(e.target.value)
                                   }
                               } id="SearchDiv">

                           <input class="form-control mr-sm-2 phnumerSearch" readOnly={pid && true} type="text" 
                                   placeholder="Enter Phone or Product ID"
                                     name="pnumber" value={pnumber}
                                     autoComplete="off"/>
                                     <button class="btn  my-2 my-sm-0" onClick={() => setSearchData()} id="Searchbtn">Search</button> 
                             </form>

                             {/* <form onSubmit={(e) => {
                                   e.preventDefault()
                                   setSearchData()
                               }}>
                               <input class="form-control mr-sm-2 phnumerSearch" readOnly={pnumber && true} type="text" placeholder="Search By Product Id"
                                name="search_id" value={pid}
                                     onClick={() => setPNumber(null)} value={pid}
                                      onChange={(e) => {setPid(e.target.value)
                                                     setPNumber(null)
                                                     document.getElementsByName("pnumber")[0].value = null
                                                   }
                                                 } /> 
                                 
                           </form> */}
                                 
                         </div>
                            
                                                 
                           <div className="form-group col-xs-6 col-sm-2 col-md-3 col-lg-2" style={{zIndex: '3'}}>
                               <DatePicker selected={dateParam} onChange={(date) => {
                                     
                                     setDateParam(date)
                                 }} id="parcelDatePick" />   
                          </div>

                          <div className="form-group col-xs-6 col-sm-2 col-md-3 col-lg-2" >
                       <Select options={branch} onChange={ (selectedBranch) =>  {
                           setSelectedBranch(selectedBranch.value)
                           //document.getElementById("FeedSearch").value = null
                       }}
                           defaultValue={{label:"All", value:"all"}}  id="employeeSelect"/> 
                   </div>
                       </div>  
                
                </CardBody>
                    {parcelStatus()}
                    <ListComponent parcel={parcels} dataStatus={sortParam} loading={loading} search={search}
                                pageParam={setPageParam}/>
                </Col>
                <Pagination items={parcels} setPageParam={setPageParam} currPage={pag === "main" ? currPage : searchPage}/>                         
                                                                        {/* currPage={((pnumber) && (sortParam !== "Delivered")) ? searchPage : currPage} 
                                                                        currPage={pnumber ? numberSearchCheck() ? searchPage : currPage : currPage} */}
            </Row>
        </div>
    );
}

export default Employee;
