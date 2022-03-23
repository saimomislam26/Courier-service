import React, {useState, useEffect, useContext} from 'react';
import {
    Row, Button,
    Col, CardBody
} from 'reactstrap';
import { ListComponent } from '../../components/dashboard';
import { GlobalContext } from '../../context/ProjectContext';
import DatePicker from "react-datepicker";
import Pagination from './page_pagination';
import Select from 'react-select';
import _ from "lodash"
import { PAGINATION_LIMIT } from '../../reducer/common';


const BranchHistory = () => {
    const {authenticateUser, setAlertData} = useContext(GlobalContext)
    const [sortParam, setSortParam] = useState(new Date())
    const [parcels, setParcels] = useState({})
    const [loading, setloading] = useState(false)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("all")
    const [branch, setBranch] = useState()
    const [currPage, setcurrPage] = useState(1)
    const [selectedBranch, setSelectedBranch] = useState(authenticateUser.Email && authenticateUser.IsSuperadmin ? "all" : authenticateUser.branch.id)
  
    useEffect(() => {
        setloading(true)

        let test =`${process.env.REACT_APP_HOST_NAME}parcelApi/bookedSend/all/${selectedBranch}/${sortParam}/${status}?page=${currPage}&limit=${PAGINATION_LIMIT}`
        console.log(test);
        fetch(test, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
             console.log(data);
                if(data.message){
                    setAlertData({messag: data.message, code:"danger"})
                    
                    setParcels({results:[]})
                } else setParcels(data)
                setloading(false)
            })
     
    },[sortParam, status,selectedBranch, currPage, authenticateUser.branch.id])
    
    useEffect(() => {
        // console.log(typeof authenticateUser.IsSuperadmin == undefined)
        if(authenticateUser.Email){
            if(authenticateUser.IsSuperadmin === false){
                setSelectedBranch(authenticateUser.branch.id)
            }else{
                setSelectedBranch("all")
            }
        }
    },[authenticateUser.branch.id])


    useEffect(() => {
        setcurrPage(1)
    }, [status, sortParam])

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
        test.unshift({value: "all", label:"All"})
        setBranch(test)
    }

    useEffect(() => {
        getBranchName()
    },[])

    const setSearchData = async() => {
        let pid = document.getElementsByName('search')[0].value
        if(pid){
            const con_url = `${process.env.REACT_APP_HOST_NAME}parcelApi/forSearch/subAdmin/${pid}/${sortParam}/${selectedBranch}/${status}`
            const all_url = `${process.env.REACT_APP_HOST_NAME}parcelTrack?id=${pid}`
            console.log(con_url);
            let res = await fetch(con_url, {
                method: "GET",
                headers:{
                    "Content-Type": "application/json"
                }
            })

            let temp = await res.json()
            console.log(temp);
            if(res.status === 200)
                setParcels({results:[temp]})
            else {
                setParcels({results:[]})
                setAlertData({message: temp.message, code: "danger"})
            }
        } else{
            setAlertData({message:"Invalid Input", code:"danger"})
        }
    }

    const setPageParam = (p) => {
        setcurrPage(p)
    }


    
    return (
        <div>
            <Row>
                <Col sm={12}>
                <CardBody className="">
                    <div className="">
                   
                         <div class="form-row">
                         <div class="form-group form-inline col-xs-12 col-sm-6 col-md-6 col-lg-6" id="SerchById">
                            <div id="SearchDiv">
                                <input class="form-control mr-sm-2" type="search" autoComplete="Off" placeholder="Search by product ID" name="search"/>
                                <button class="btn my-2 my-sm-0" onClick={() => setSearchData()} id="Searchbtn">Search</button>
                            </div>
                        </div>
                        {/* <div className="" id="ParcelPat"> */}
                            <div className="form-group col-xs-6 col-sm-3 col-md-3 col-lg-2">
                                <select className="custom-select"  onChange={(e) => setStatus(e.target.value)} id="selectstyle">
                                    <option value="all">All Parcel </option>
                                    <option value="Booked">Booked Parcel</option>
                                    <option value="Sent">Sent Parcel</option>
                                    <option value="Recieved">Recieved Parcel</option>
                                    <option value="Delivered">Delivered Parcel</option>
                                    <option value="Expected">To Be Recieved</option>
                                </select>
                            </div>
                            {/* <div> */}
                            

                           {authenticateUser.IsSuperadmin && authenticateUser.Email && 
                           <div className="form-group col-xs-6 col-sm-2 col-md-3 col-lg-2" id="" style={{zIndex:'3'}}>
                               {/* SelectBFFeeds */}
                                <Select options={branch} onChange={ (selectedBranch) =>  setSelectedBranch(selectedBranch.value)}
                                        defaultValue={{label:"All", value:"all"}} id="adminBranchListS"/> 
                                </div>}
                                {/* form-group  lco-md-2 */}
                            <div className="form-group col-xs-6 col-sm-2 col-md-3 col-lg-2"id="PDatePikerDiv">
                                <DatePicker selected={sortParam} onChange={(date) => setSortParam(date)}  id="ParcelHdatePiker"/>   
                           </div>
                        </div>
                        {/* </div>   */}
                    </div>
                </CardBody>
                    {parcels && <ListComponent parcel={parcels} nav="branch history" loading={loading} search={search}/>}
                </Col>

                <Pagination items={parcels} setPageParam={setPageParam} currPage={currPage}/>

            </Row>
        </div>
    );
}

export default BranchHistory;
