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


const Archive = () => {
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
        let test =`${process.env.REACT_APP_HOST_NAME}archivedParcel/${sortParam}/${selectedBranch}/?page=${currPage}&limit=${PAGINATION_LIMIT}&parcelId=null`
        getData(test)
     
    },[sortParam, selectedBranch, currPage, authenticateUser.branch.id])

    const getData = (test) => {
        setloading(true)
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
            } else {
                setParcels(data)
                document.getElementsByName('search')[0].value = ""
            }
            setloading(false)
        })
    }
    
    useEffect(() => {
        // console.log(typeof authenticateUser.IsSuperadmin == undefined)
        if(authenticateUser.Email){
            if(authenticateUser.IsSuperadmin === false){
                setSelectedBranch(authenticateUser.branch.id)
            }else{
                setSelectedBranch("all")
                getBranchName()
            }
        }
    },[authenticateUser.branch.id])


    useEffect(() => {
        setcurrPage(1)
    }, [sortParam])

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


    const setSearchData = async() => {
        let pid = document.getElementsByName('search')[0].value
        if(pid){
            let test =`${process.env.REACT_APP_HOST_NAME}archivedParcel/${sortParam}/${selectedBranch}/?page=${currPage}&limit=${PAGINATION_LIMIT}&parcelId=${pid}`
            getData(test)
        }
        setcurrPage(1)
    }


    const setPageParam = (p) => {
        setcurrPage(p)
    }


    
    return (
        <div>
            <Row>
                <Col sm={12}>
                <CardBody className="">
                   
                         <div class="form-row">
                         <div class="form-group form-inline col-xs-12 col-sm-6 col-md-6 col-lg-8" id="SerchById">
                            <div id="SearchDiv">
                                <input class="form-control mr-sm-2" type="search" autoComplete="off" placeholder="Search by product ID" name="search"/>
                                <button class="btn my-2 my-sm-0" onClick={() => setSearchData()} id="Searchbtn">Search</button>
                            </div>
                        </div>
                            {authenticateUser.Email && <div className="form-group col-xs-6 col-sm-2 col-md-3 col-lg-2"id="ADatePikerDiv" style={{zIndex: '3'}}>
                                <DatePicker selected={sortParam} onChange={(date) => setSortParam(date)}  id="ParcelHdatePiker"/>   
                           </div>}
                           {authenticateUser.IsSuperadmin && authenticateUser.Email && 
                                <div className="form-group col-xs-6 col-sm-2 col-md-3 col-lg-2" id="">
                            
                                    <Select options={branch} onChange={ (selectedBranch) =>  setSelectedBranch(selectedBranch.value)}
                                        defaultValue={{label:"All", value:"all"}} id="adminBranchListS"/> 
                                </div>}
                        </div>
                        {/* </div>   */}
                </CardBody>
                    {parcels && <ListComponent parcel={parcels} nav="branch history" loading={loading} search={search}/>}
                </Col>

                <Pagination items={parcels} setPageParam={setPageParam} currPage={currPage}/>

            </Row>
        </div>
    );
}

export default Archive;
