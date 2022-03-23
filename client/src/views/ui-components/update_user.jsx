import React, {useState, useEffect, useContext} from 'react';
import { Container, Card, CardBody, CardTitle } from 'reactstrap';
import {GlobalContext} from "../../context/ProjectContext"
import { useParams, useHistory } from 'react-router';
import Select from 'react-select';
import BeatLoader from 'react-spinners/BeatLoader'
import { setFeeds } from '../../reducer/common';


const UpdateUser = () => {
    const [userData, setUserData] = useState({Email: "", Username:"", Password:"", Cpassword:"",
         branchName:"", branch: "", Section:""})
    const [branch, setBranch] = useState([])
    const {authenticateUser, setAlertData} = useContext(GlobalContext);
    const [defaultBranch, setDefaultBranch] = useState({})
    const [loading, setLoading] = useState(true)
    const {uid} = useParams()
    const history = useHistory()
    

    useEffect(() => {
        setLoading(true)
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
        }
        authenticateUser.IsSuperadmin && getBranchName()

        fetch(`${process.env.REACT_APP_HOST_NAME}userApi/user/${uid}`, {
            method: "GET",
            headers:{
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setUserData({Email: data.Email, Username: data.Username,
                branch: data.branch._id, Section: data.Section})   
            setDefaultBranch({value:data.branch._id, label:data.branch.branch})
            setLoading(false)
        })
    }, [])
    

    const password_show_hide = (id) => {
        var x = document.getElementById(id);
        var show_eye = document.getElementById(`${id} show_eye`);
        var hide_eye = document.getElementById(`${id} hide_eye`);
        hide_eye.classList.remove("d-none");
        if (x.type === "password") {
          x.type = "text";
          show_eye.style.display = "none";
          hide_eye.style.display = "block";
        } else {
          x.type = "password";
          show_eye.style.display = "block";
          hide_eye.style.display = "none";
        }
    }

  

    const handleUserData = async(e) => {
        e.preventDefault()
        
        if(authenticateUser.IsSuperAdmin){
            userData['IsAdmin'] = true
            const branch = document.getElementById('CuserSelect').value
            userData["branchID"] = branch
        }
        
       
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}userApi/user/update/${uid}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...userData
                })
            }) 
        
        const temp = await res.json()
        if(res.status === 200){
            const feedsData = {
                user: authenticateUser._id,
                message: `<b>${userData.Username}</b> has been edited by <b>${authenticateUser.Username}</b>`,
                branch: authenticateUser.branch.id,
                tag: "user"
            }
        
            setFeeds(feedsData)
            setAlertData({message: "User update Successfilly", code: "success"})
            setUserData({Email: "", Username:"", Password:"", Cpassword:""})
            history.goBack()
        } else{
            
            setAlertData({message: temp.message, code: "danger"})
        }

        
    }
  
    return (
        <div>
            <Card>
                <CardTitle className="bg-light border-bottom p-3 mb-0">
                    <i className="mdi mdi-apps mr-2"> </i>
                    Update User
                </CardTitle>

                <CardBody className="">
                    <Container>
                    {loading ? <div className="show-pic"><BeatLoader color={"#0178bc"} loading={loading} size={50} /></div> :
                        <div className="container-fluid">
                            <div className="row d-flex justify-content-center align-items-center m-0">
                            <div className="login_oueter" id="updateUser">
                                <form action="" method="post" id="login" autocomplete="off" 
                                    className="bg-light border p-3" onSubmit={(e) =>handleUserData(e)}>
                                <div className="form-row">
                                    <h4 className="title my-3">Update User</h4>
                                    <div className="col-12">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                        <span className="input-group-text" id="basic-addon1"><i className="fas fa-user"></i></span>
                                        </div>
                                        <input name="username" type="text" value={userData.Username} className="input form-control" id="username" 
                                        placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" 
                                        onChange={(e) => {
                                            setUserData({...userData, Username: e.target.value})}}/>
                                    </div>
                                    </div>
                                    <div className="col-12">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                        <span className="input-group-text" id="basic-addon1"><i class="fas fa-user-tag"></i></span>
                                        </div>
                                        <input name="email" type="text" value={userData.Email} className="input form-control" id="email"
                                        placeholder="Enter Your Name" aria-label="Username" aria-describedby="basic-addon1" 
                                        onChange={(e) => setUserData({...userData, Email: e.target.value})}/>
                                    </div>
                                    </div>


                                    {authenticateUser.IsSuperadmin && <div className="col-12">
                                        <div className="input-group mb-3" style={{flexWrap: 'nowrap'}}>
                                            <div className="input-group-prepend">
                                                <span className="input-group-text" style={{padding:"0.375rem 0.90rem"}} id="basic-addon1"><i className="fas fa-code-branch"></i></span>
                                            </div>
                                            <Select options={branch} defaultValue={defaultBranch} 
                                                    onChange={ (selectedBranch) =>  setUserData({...userData, branch:selectedBranch.value})} className="form-select" style={{marginTop: 0}} id="CuserSelect"/> 
                                                
                                        </div>
                                    </div> }

                                    { userData.Section !== "Authority" &&
                                    <div className="col-12">
                                        <div className="input-group mb-3" style={{flexWrap: 'nowrap'}}>
                                            <div className="input-group-prepend">
                                                <span className="input-group-text" id="basic-addon1" style={{padding:"0.375rem 0.71rem"}}><i className="fas fa-user-plus"></i></span>
                                            </div>
                                            <Select options={[{label:"Delivery", value: "delivery"}, {label:"Booking", value:"booking"}]}
                                                defaultValue={{label:userData.Section, value:userData.Section}}
                                                onChange={ (selectedSection) =>  setUserData(userData => ({...userData, Section:selectedSection.value}))}
                                                className="form-select" style={{marginTop: 0}}/> 
                                        
                                        </div>
                                    </div>   }


                                    <div className="col-12">
                                        <div className="input-group mb-3">
                                            <div className="input-group-prepend">
                                            <span className="input-group-text" id="basic-addon1"><i className="fas fa-lock"></i></span>
                                            </div>
                                            <input name="password" type="password" value={userData.Password} className="input form-control" id="password" 
                                            placeholder="password" aria-label="password" aria-describedby="basic-addon1" 
                                            onChange={(e) => setUserData({...userData, Password: e.target.value})}/>
                                            <div className="input-group-append">
                                            <span className="input-group-text" onClick={() => password_show_hide("password")}>
                                                <i className="fas fa-eye" id="password show_eye"></i>
                                                <i className="fas fa-eye-slash d-none" id="password hide_eye"></i>
                                            </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-12">
                                        <div className="input-group mb-3">
                                            <div className="input-group-prepend">
                                            <span className="input-group-text" id="basic-addon1"><i className="fas fa-lock"></i></span>
                                            </div>
                                            <input name="confirm password" type="password" value={userData.Cpassword} className="input form-control" id="confirm password" 
                                            placeholder="confirm password" aria-label="password" aria-describedby="basic-addon1" 
                                            onChange={(e) => setUserData({...userData, Cpassword: e.target.value})}/>
                                            <div className="input-group-append">
                                            <span className="input-group-text" onClick={() => password_show_hide("confirm password")}>
                                                <i className="fas fa-eye" id="confirm password show_eye"></i>
                                                <i className="fas fa-eye-slash d-none" id="confirm password hide_eye"></i>
                                            </span>
                                            </div>
                                        </div>  
                                    </div>
                                
                                    <div className="col-12 updatebtn" id="loginbtnDiv">
                                        <button className="btn btn" type="submit" id="signinbtn" name="signin">Update</button>
                                        <button className="btn btn" id="signinbtn" name="cancel" onClick={() => history.push('/employees')}>Cancel</button>
                                    </div>
                                </div>
                                </form>
                                {/* <div className="col-12" id="loginbtnDiv">
                                   
                                </div> */}
                            </div>
                            </div>
                        </div>}
                    </Container>
                </CardBody>
            </Card>
            
        </div>
    );
}

export default UpdateUser;