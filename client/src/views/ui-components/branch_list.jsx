import React, {useState, useEffect, useContext, useRef} from 'react'
import {
    Card,
    CardBody,
    CardTitle
} from 'reactstrap';
import {GlobalContext} from "../../context/ProjectContext"
import Pagination from './page_pagination'
import { PAGINATION_LIMIT, setFeeds } from '../../reducer/common';
import BeatLoader from 'react-spinners/BeatLoader'
import _ from "lodash"

function BranchList() {
    const firstLoad = useRef(false)
    const [branchList, setBranchList] = useState([])
    const [searchedBranchList, setSearchedBranchList] = useState()
    const [editable, setEditable] = useState("")
    const {authenticateUser, setAlertData} = useContext(GlobalContext);
    const [createBranch, setCreateBranch] = useState({branch:"",contact:""})
    const [updateBranch, setUpdateBranch] = useState({branch:"",contact:""})
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [searchCurrPage, SetsearchCurrPage] = useState(1)
    
    let branches = searchedBranchList ? searchedBranchList : data.results

    // For Pagination
    const pageSize = 5;
    // const [pagePost, setpagePost] = useState([])
    const [currPage, setcurrPage] = useState(1)
   

    const getData = async () => {
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}testApi/branchTest?page=${currPage}&limit=${PAGINATION_LIMIT}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })
        const temp = await res.json();
        console.log(temp);
        setData(temp);
        setLoading(false)
    }


    useEffect(() => {
        setLoading(true)
        getData()
   
        // fetch(`${process.env.REACT_APP_HOST_NAME}branchApi/getBranch`, {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json"
        //     }
        // })
        // .then(response => response.json())
        // .then(data => {
        //     console.log(data);
        //     setBranchList(data)
        //     setLoading(false)
        // })
        
    }, [])
  
    const deleteBranch = async(id) => {
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}branchApi/deleteBranch/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const temp = await res.json()
        console.log(temp);
        if(res.status === 200){
            let del_branch = data
            del_branch.results = del_branch.results.filter(i => i._id !== id)
            setData(del_branch)
            const feedsData = {
                user: authenticateUser._id,
                message: `<b>${temp.branch}<b>  branch has been deleted by <b>${authenticateUser.Username}<b>`,
                branch: authenticateUser.branch.id,
                tag: "other"
              }
              setFeeds(feedsData)
            setAlertData({message: "Delete Successfully", code: "success"})
        } else if(res.status === 400){
            setAlertData({message: temp.message, code: "danger"})
        } else {
            setAlertData({message: "Something Wrong", code: "danger"})
        }
        
    }
    
    const changeBranchData = (event) => {
        editable ? setUpdateBranch({...updateBranch, [event.target.name]:event.target.value}) : 
        setCreateBranch({...createBranch, [event.target.name]:event.target.value})
    }

    const handleCreateParcel = (event) => {
        event.preventDefault()
        fetch(`${process.env.REACT_APP_HOST_NAME}branchApi/createBranch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...createBranch
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.message)
                setAlertData({message: data.message, code: "danger"})
            else {
                setBranchList(branchList =>[...branchList, data.branch])
                setCreateBranch({branch:"",contact:""})
                const feedsData = {
                    user: authenticateUser._id,
                    message: `<b>${data.branch.branch}</b>  branch has been created by <b>${authenticateUser.Username}<b>`,
                    branch: authenticateUser.branch.id,
                    tag: "other"
                  }
                  setFeeds(feedsData)
                setAlertData({message: "Branch Create Successfully", code: "success"})
            }
        })
    }   

    // useEffect(() => {
    //    handleSearchParcel()
    // }, [searchValue])


    const handleSearchParcel = () => {
        console.log("sesarch");
        setLoading(true)
        searchValue ?
            fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/searchBranch?page=${searchCurrPage}&limit=${PAGINATION_LIMIT}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    branch: searchValue
                })
            })
            .then(response => response.json())
            .then(data => {
                setData(data)
                setLoading(false)
            }) :
            getData()
        
    }

    useEffect(() => {
        if(firstLoad.current){
            const delayDebounceFn = setTimeout(() => {
                handleSearchParcel()
            }, 1000)
        
            return () => clearTimeout(delayDebounceFn)
        } else{
            firstLoad.current = true
        }
      }, [searchValue])


    const searchField = () => {
        return (
            <>
            <form onChange={(e)=> {setSearchValue(e.target.value)}}>
                <li className="list-inline-item" id="BSearchDivElist">
                    <input className="input form-control" autoComplete="Off" placeholder="Search By Branch Name" name="branch"/>
                    {/* <button className="btn btn-info" 
                        onClick={() => {toogle === "Create" ? setToggle("Search"): setToggle("Create")}}>{toogle}</button> */}
                    <button type="button" id="createBtnAdmin" className="btn btn-info" data-toggle="modal" data-target="#exampleModalCenter">
                        Create Branch
                    </button>
                </li>
            </form>
            <br/>
                   </>
        )
    }

    const setPageParam = (page) => {
        setcurrPage(page);
        getData()
    }

    const setSearchPageParam = (page) => {
        SetsearchCurrPage(page);
    }
 
    const addBranchField = () => {
        return(<>
        
            <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLongTitle">Create branch</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <li className="list-inline-item">
                                <input className="input form-control" placeholder="Enter Branch Name" name="branch" autoFocus
                                value={createBranch.branch} onChange={(e) => changeBranchData(e)}/>
                            </li>
                            <li className="list-inline-item">
                                <input className="input form-control" placeholder="Enter A Contact Number" name="contact"
                                value={createBranch.contact} onChange={(e) => changeBranchData(e)}/>
                            </li>
                    
                        </form>
                    </div>
                    <div class="modal-footer">
                        {/* <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> */}
                        <button type="button" class="btn btn-primary" data-dismiss="modal"
                             onClick={(e)=>handleCreateParcel(e)} style={{background: '#017abd', border: 'none'}}>Create Branch</button>
                    </div>
                    </div>
                </div>
            </div>
        </>)
    }

    const editData = async(id) => {
        setEditable("")
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}branchApi/updateBranch/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...updateBranch
            })
        })

        const temp = await res.json()
        const feedsData = {
            user: authenticateUser._id,
            message: `<b>${createBranch.branch}</b> name has been updated by <b>${authenticateUser.Username}</b>`,
            branch: authenticateUser.branch.id,
            tag: "other"
          }
          setFeeds(feedsData)
        setUpdateBranch({branch:"", contact:""})

        let temp_branches = branches
     
        temp_branches = temp_branches.map(i => {
            if(i._id === id) return temp
            else return i
            })
   
        setData({results:temp_branches})
    }

    const makeEditable = (branch) => {
        setEditable(branch._id)
        setUpdateBranch({branch:branch.branch, contact:branch.contact})
    }


    return (
        <Card>
            <CardBody>
                <div className="d-md-flex no-block" id="branchListNav">
                    <CardTitle>Branch List</CardTitle>
                    <div className="ml-auto form-between" id="BranchCreateDiv">
                        {addBranchField()}
                        {searchField()}
                    </div>
                   
                </div>
                {loading ? (<div className="show-pic"><BeatLoader color={"#0178bc"} loading={loading} size={50} /></div>) :
                    <div className="table-responsive mt-2">
                    <table className="table stylish-table mb-0 mt-2 no-wrap v-middle">
                        <thead>
                            <tr>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Name</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Contact</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom" colSpan="2" style={{textAlign: 'center'}}>Action</th>
                                {/* <th className="font-weight-normal text-muted border-0 border-bottom">Edit</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {data.results&&branches.map((branch, key) => (
                            <tr key={key}>
                        
                                    {editable === branch._id ? 
                                    <>
                                        <td className='branchNameTd'><input className="input form-control" style={{width:"40%"}} placeholder="Enter Branch Name" name="branch"
                                            value={updateBranch.branch} onChange={(e) => changeBranchData(e)}/></td>
                                        <td><input className="input form-control" style={{width:"60%"}} placeholder="Enter Number" name="contact"
                                            value={updateBranch.contact} onChange={(e) => changeBranchData(e)}/></td>
                                    </> : 
                                    <>
                                        <td><h6 className="font-weight-medium mb-0 nowrap text-left">{branch.branch}</h6></td>
                                        <td className="text-left"><span className="d-inline-block text-left">{branch.contact}</span></td>
                                    </>}
                                
                               
                                <td className="text-right"><button class="Deletebtn" onClick={() => {editable ? setEditable("") : deleteBranch(branch._id)}}>{editable === branch._id ? "Cancel" : "Delete"}</button></td>
                                <td className="text-left"><button class="buttonAll" onClick={() => {editable ? editData(branch._id) : makeEditable(branch)}} id="editbtn">{editable === branch._id ? "Save" : "Edit"}</button></td>

                             
                            </tr>
                            ))}
                            
                        </tbody>
                    </table>     
                </div>}
            </CardBody>
            <Pagination items={data} setPageParam={searchValue ? setSearchPageParam : setPageParam} currPage={searchValue ? searchCurrPage : currPage}/>
    
        </Card>
        
    )
}

export default BranchList
