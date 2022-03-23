import React, {useState, useEffect, useContext} from 'react'
import {GlobalContext} from "../../context/ProjectContext"
import {
    Card,
    CardBody,
    CardTitle, Nav, NavItem, NavLink
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import Pagination from './page_pagination'
import _ from "lodash"
import BeatLoader from 'react-spinners/BeatLoader'
import Select from 'react-select';
import { PAGINATION_LIMIT, setFeeds } from '../../reducer/common';


function EmployeeList() {
    const {authenticateUser, setAlertData, auth} = useContext(GlobalContext)
    const [userList, setUserList] = useState([])
    const [branch, setBranch] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState("all")
    const [searchValue, setSearchValue] = useState("")
    const [employeeType, setEmployeeType] = useState("SubAdmin")
    const history = useHistory()
    const [currPage, setcurrPage] = useState(1)
    const [searchCurrPage, setSearchcurrPage] = useState(1)
   
    useEffect(() => {
       setLoading(true)
        authenticateUser.IsSuperadmin && getBranchName()
        let branch_url = `${process.env.REACT_APP_HOST_NAME}userApi/Admin/getSubadmin/${selectedBranch}?page=${currPage}&limit=${PAGINATION_LIMIT}`
        let subAdmin_branch_emp = `${process.env.REACT_APP_HOST_NAME}userApi/user/getUserbranch/${authenticateUser.branch.id}?page=${currPage}&limit=${PAGINATION_LIMIT}`
        let emp_url = `${process.env.REACT_APP_HOST_NAME}userApi/user/getUser?page=${currPage}&limit=${PAGINATION_LIMIT}`
        let admin_emp_url = `${process.env.REACT_APP_HOST_NAME}userApi/user/getUserbranch/${selectedBranch}?page=${currPage}&limit=${PAGINATION_LIMIT}`

        //let main = authenticateUser.IsSuperadmin && employeeType === "Employee" ? emp_url : branch_url
        let main = authenticateUser.IsSuperadmin && employeeType === "Employee" ? selectedBranch !== "all" ? admin_emp_url : emp_url : branch_url
       
        fetch(authenticateUser.IsAdmin ? subAdmin_branch_emp : main, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
           setUserList(data)  
           setLoading(false)
        })
      
    }, [selectedBranch, authenticateUser.branch.id, currPage, employeeType])


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

    const deleteUser = (id, email) => {
        fetch(`${process.env.REACT_APP_HOST_NAME}userApi/user/delete/${id}`, {
            method: "DELETE",
            headers:{
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if(response.status === 200){
                const feedsData = {
                    user: authenticateUser._id,
                    message: `<b>${email}</b> user has been deleted by <b>${authenticateUser.Username}</b>`,
                    branch: authenticateUser.branch.id,
                    tag: "user"
                }
                setFeeds(feedsData)
                setAlertData({message: "User Delete Successfully", code: "success"})
            }
            let temp = userList
            temp.results = temp.results.filter(i => i._id !== id)
            setUserList(temp)
        })
    }

    useEffect(() => {
        searchValue && searchData()
    }, [searchCurrPage, searchValue])

    const getSearchItem = async(e) => {
        e.preventDefault();
        setSearchValue(e.target.name.value)  
    }

    const searchData = async(x) => {
        setLoading(true)
        let subAdmin_url = `${process.env.REACT_APP_HOST_NAME}userApi/userSearch/${authenticateUser.branch.id}?page=${searchCurrPage}&limit=${PAGINATION_LIMIT}&value=0` 
        let admin_url = `${process.env.REACT_APP_HOST_NAME}userApi/userSearch/all?page=${searchCurrPage}&limit=${PAGINATION_LIMIT}&value=${employeeType}`
        console.log(authenticateUser.IsSuperadmin ? admin_url : subAdmin_url);
        fetch(authenticateUser.IsSuperadmin ? admin_url : subAdmin_url, {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userName: searchValue
            })
        }).then(response => response.json())
        .then(data => {
            console.log(data);
            setUserList(data)
            setLoading(false)

        })
    }

    const employeeCatagory = () => {
        return(
            <Nav tabs>

            <NavItem>
              <NavLink
               className={employeeType==="SubAdmin" && "active"}
                onClick={() => {
                    setEmployeeType("SubAdmin")
                    setSearchValue("")
                }}
              >
                Branch Manager
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
               className={employeeType==="Employee" && "active"}
                onClick={() => {
                    setEmployeeType("Employee")
                    setSearchValue("")
                }}
              >
                Employee
              </NavLink>
            </NavItem>
          </Nav>
        )
    }

    const searchField = () => {
        return (
            <>
            <form onSubmit={(e) => getSearchItem(e)} style={{marginLeft: 'auto'}}>
                <li className="list-inline-item" id="BSearchDiv">
                    <input className="input form-control me-2" autoComplete="Off" placeholder="Search By User Name" 
                     name="name"
                     />
                    <button type="submit" className="btn btn-info">
                        search
                    </button>
                </li>
            </form>
                   </>
        )
    }
  
    const setPageParam = (p) => {
        searchValue ? setSearchcurrPage(p) : setcurrPage(p)
    }

    return (
        <Card>
            <CardBody>
                <div className="d-md-flex no-block" id="accoutList">
                    <CardTitle>All Employee</CardTitle>
                    {searchField()}
                    { authenticateUser.IsSuperadmin && <div className="branchSelet">
                    <Select className="form-select form-select-sm" options={branch}
                            onChange={ (selectedBranch) =>  {
                                setSelectedBranch(selectedBranch.value)
                                setSearchValue("")
                                }}/> 
                    </div>}
                </div>
                {loading ? <div className="show-pic"><BeatLoader color={"#0178bc"} loading={loading} size={50} /></div> :
                <div className="table-responsive mt-2">
                    {authenticateUser.IsSuperadmin && employeeCatagory()}
                    <table className="table stylish-table mb-0 mt-2 no-wrap v-middle">
                        <thead>
                            <tr>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Name</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Username</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom">Branch</th>
                                <th className="font-weight-normal text-muted border-0 border-bottom" colSpan="2" style={{textAlign: 'center'}}>Action</th>
                               
                            </tr>
                        </thead>
                        <tbody id="BranchEmployeedb">
                            {userList.results && userList.results.map((user, key) => (
                            <tr>
                                <td><span className="d-inline-block text-left" style={{textAlign:'left'}}>{user.Email}</span></td>
                                <td>
                                    <h6 className="font-weight-medium mb-0 nowrap">{user.Username}</h6></td>
                                <td style={ user.branch || {color: "#FF0000"}}>{user.branch ? user.branch.branch : "No Branch"}</td>
                                <td style={{textAlign:'right'}}><button className="Deletebtn" onClick={() => deleteUser(user._id, user.Email)}>Delete</button></td>
                                <td style={{textAlign:'left'}}><button className="buttonAll" onClick={() => history.push(`update-employee/${user._id}`)} id="editbtn">Edit</button></td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </CardBody>
            <Pagination items={userList} setPageParam={setPageParam} currPage={searchValue ? searchCurrPage :currPage}/>                         
        </Card>
    )
}

export default EmployeeList
