
import React, {useState, useEffect, useContext} from "react";
import {
    Card,
    CardBody,
    CardTitle,
} from 'reactstrap';
import DatePicker from "react-datepicker";
import Select from 'react-select';
import BeatLoader from 'react-spinners/BeatLoader'
import Pagination from '../../../views/ui-components/page_pagination'
import { GlobalContext } from "../../../context/ProjectContext";
import { PAGINATION_LIMIT } from "../../../reducer/common";

const Feeds = () => {
    const [feeds, setFeeds] = useState([])
    const [today, setToday] = useState(new Date())
    const {authenticateUser ,setAlertData} = useContext(GlobalContext)
    const [branch, setBranch] = useState("all")
    const [currPage, setcurrPage] = useState(1)
    const [searchCurrPage, setSearchCurrPage] = useState(1)
    //const [searchValue, setSearchValue] = useState()
    const [searchText, setSearchText] = useState()
    const [loading, setLoading] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState(authenticateUser.Email && authenticateUser.IsSuperadmin ? "all" : authenticateUser.branch.id)
    console.log(selectedBranch);
    const icon_class = {
        "user": "ti-user",
        "parcel": "ti-shopping-cart",
        "other": "fas fa-bell"
    }
    var ago = require("timetoreadable");

    const getFeedsData = async() => {
        fetch(`${process.env.REACT_APP_HOST_NAME}historyApi/seeHistory/${today}/${selectedBranch}?page=${currPage}&limit=${PAGINATION_LIMIT}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.length === 0)
                setAlertData({message: "No Data Found", code:"danger"})
            setFeeds(data)
            setLoading(false)
        })
    }

    
    useEffect(() => {
        setLoading(true)
        getFeedsData()
    },[today, selectedBranch, currPage])

    useEffect(() => {
        getBranchName()
    }, [])

    useEffect(() => {
        setcurrPage(1)
    }, [selectedBranch, today])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
          searchFeeds()
        }, 1000)
    
        return () => clearTimeout(delayDebounceFn)
      }, [searchText])
    
    const searchFeeds = async() => {
        if(searchText){
            setLoading(true)
            let x = authenticateUser.IsSuperadmin ? "null" : authenticateUser.branch.id
            console.log(`${process.env.REACT_APP_HOST_NAME}historyApi/historySearch/${x}`);
            fetch(`${process.env.REACT_APP_HOST_NAME}historyApi/historySearch/${x}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    searchText:searchText
                })
            })
            .then(response => 
                response.json())
            .then(data => {
                if(data.message){
                    setFeeds({results:[]})
                    setAlertData({message:"No data found", code:"danger"})
                }
                else{
                    setFeeds({results:data})
                }
                setLoading(false)
            })
        } else{
            getFeedsData()
            //setAlertData({message:"Invalid Input", code:"danger"})
        }
    }

    useEffect(() => {
        
        if(authenticateUser.Email){
            if(authenticateUser.IsSuperadmin === false){
                setSelectedBranch(authenticateUser.branch.id)
            }else{
                setSelectedBranch("all")
            }
        }
    },[authenticateUser.branch.id])

    const setPageParam = (p) => {
        setcurrPage(p)
    }

    const setSearchPageParam = (page) => {
        setSearchCurrPage(page);
    }

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

    return (
        <Card className="card">
            <CardBody className="card-body">
                <div class="form-row" id="SearchNav">
                {/* col-md-8 */}

                    <div class="input-group form-inline is-invalid col-xs-12 col-sm-6 col-md-6 col-lg-8" >
                    {/* id="SearchDivs" */}
                        <div id="FeedsSearch">
                             {/* SearchDiv */}
                            <input class="form-control mr-sm-2" type="search" autoComplete="Off" placeholder="Search" name="search"
                                onChange={(e) => setSearchText(e.target.value)} id="FeedSearch"/>
                            {/* <button class="btn  my-2 my-sm-0" onClick={() => searchFeeds()} id="Searchbtn">Search</button> */}
                        </div>
                        
                    </div>

                    {/* <div id="FeedsNav"> */}

                    {authenticateUser.IsSuperadmin && 
                    <div className="form-group col-xs-12 col-sm-3 col-md-3 col-lg-2" id="">
                        <Select options={branch} onChange={ (selectedBranch) =>  {
                            setSelectedBranch(selectedBranch.value)
                            document.getElementById("FeedSearch").value = null
                        }}
                            defaultValue={{label:"All", value:"all"}} id="FeedsBranchList"/> 
                    </div>}


                    <div className="form-group col-xs-12 col-sm-3 col-md-3 col-lg-2" style={{textAlign: 'right'}}>
                        <DatePicker id="prodactdate" selected={today} onChange={(date) => {
                            setToday(date)
                            document.getElementById("FeedSearch").value = null
                            }} />   
                    </div>
            {/* </div> */}
                    
                </div>  
                <CardTitle className="card-title">Feeds</CardTitle>
               { loading ? (<div className="show-pic"><BeatLoader color={"#0178bc"} loading={loading} size={50} /></div>) : <ul className="feeds pl-0 mb-0 mt-3 pt-1">
                    {feeds.results && feeds.results.map((feed, key) => 
                    <li className="feed-item d-flex p-2 align-items-center" key={key}>
                        <a href="#" className="btn btn-circle d-flex align-items-center justify-content-center bg-light-info">
                            <i className={icon_class[feed.tag] || "fas fa-bell"}></i>
                        </a>
                        <div className="ml-3 text-truncate" id="feedsTextcontent" dangerouslySetInnerHTML={{ __html: feed.message }}></div>
                        <div className="justify-content-end text-truncate ml-auto">
                            <span className="text-muted font-12">{ago.Beautify(feed.createdAt)}</span>
                        </div>
                    </li>
                    )}
                </ul>}
            </CardBody>
            <Pagination items={feeds} setPageParam={searchText ? setSearchPageParam : setPageParam} currPage={searchText ? searchCurrPage : currPage}/>        </Card>
    );
}



export default Feeds;