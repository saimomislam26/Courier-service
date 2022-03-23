import React, {useState, useEffect, useContext} from 'react';
import { Container, Card, CardBody, CardTitle } from 'reactstrap';
import {GlobalContext} from "../../context/ProjectContext"
import Select from 'react-select';
import { setFeeds } from '../../reducer/common';


const CreateUser = () => {
    const [userData, setUserData] = useState(
        {Email: "", Username:"", Password:"", Cpassword:"", contact:"", Section:""})
    const [branch, setBranch] = useState([])
    const {authenticateUser, setAlertData} = useContext(GlobalContext);
    const [newUserBranch, setNewUserbranch] = useState(authenticateUser.branch.id)
    const [createAlert, setAlert] = useState({msg:"", code:"", visibility:false})

    // useEffect(() => {
    //     if(createAlert.visibility && !(createAlert.code === "success"))
    //         setAlert({...createAlert, visibility:false, code: "info"})
    // }, [userData])
    

    useEffect(() => {
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
        getBranchName()
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

    useEffect(() => {setNewUserbranch(authenticateUser.branch.id)},[authenticateUser.branch.id])
   

    const handleUserData = async(e) => {
        e.preventDefault()
        
        if(authenticateUser.IsSuperadmin){
            userData['IsAdmin'] = true
            userData['Section'] = "Authority"
        }
        if(!newUserBranch){
            setAlertData({message: "Please Select Branch", code: "danger"})
            return
        }
        console.log(userData);
     
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}userApi/user/${newUserBranch}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...userData
                })
            }) 
        
        const temp = await res.json()
        console.log(temp);
        if(res.status === 200){
            const feedsData = {
                user: authenticateUser._id,
                message: `<b>${userData.Email}</b> has been created by <b>${authenticateUser.Username}</b>`,
                branch: authenticateUser.branch.id,
                tag: "user"
            }
            setFeeds(feedsData)
            setAlertData({message: "User Create Successfilly", code: "success"})
            setUserData({Email: "", Username:"", Password:"", Cpassword:"", contact: ""})
        } else{
            
            setAlertData({message: temp.message, code: "danger"})
        }
    }
   
    return (
        <div>
            <Card>
                <CardTitle className="bg-light border-bottom p-3 mb-0">
                    <i className="mdi mdi-account-key mr-2"> </i>
                    Create A User
                </CardTitle>

                <CardBody className="">
                    <Container>
                   
                        <div className="container-fluid">
                            <div className="row d-flex justify-content-center align-items-center m-0">
                            <div className="login_oueter" style={{marginTop: '0px'}}>
                                <form action="" method="post" id="login" autocomplete="off" 
                                    className="bg-light border p-3" onSubmit={(e) =>handleUserData(e)}>
                                <div className="form-row">
                                    <h4 className="title my-3">Create  { authenticateUser.IsAdmin ? "An Employee" : authenticateUser.IsSuperadmin && "A Branch Manager"} Account</h4>
                                    <div className="col-12">
                                        <div className="input-group mb-3 ">
                                            <div className="input-group-prepend cUserInputstyle">
                                            <span className="input-group-text" id="basic-addon1"><i className="fas fa-user"></i></span>
                                            </div>
                                            <input name="username" type="text" value={userData.Username} className="input form-control cUserInputstyle" id="username" 
                                            placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" 
                                            onChange={(e) => {
                                                setUserData({...userData, Username: e.target.value})}}/>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="input-group mb-3">
                                            <div className="input-group-prepend">
                                            <span className="input-group-text" id="basic-addon1"><i className="fas fa-phone"></i></span>
                                            </div>
                                            <input name="contact" type="text" value={userData.contact} className="input form-control" id="contact" 
                                            placeholder="Contact" aria-label="Contact" aria-describedby="basic-addon1" 
                                            onChange={(e) => {
                                                setUserData({...userData, contact: e.target.value})}}/>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                        <span className="input-group-text" id="basic-addon1"><i class="fas fa-user-tag"></i></span>
                                        </div>
                                        <input name="email" type="text" value={userData.Email} className="input form-control" id="email"
                                        placeholder="Enter Name" aria-label="Username" aria-describedby="basic-addon1" 
                                        onChange={(e) => setUserData({...userData, Email: e.target.value})}/>
                                    </div>
                                    </div>


                                    {authenticateUser.IsSuperadmin && <div className="col-12">
                                        <div className="input-group mb-3" style={{flexWrap: 'nowrap'}}>
                                            <div className="input-group-prepend">
                                                <span className="input-group-text" id="basic-addon1"><i className="fas fa-code-branch"></i></span>
                                            </div>
                                            
                                            <Select options={branch} placeholder="Branch"  
                                                onChange={ (selectedBranch) =>  setNewUserbranch(selectedBranch.value)} className="form-select" style={{marginTop: 0}} id="CuserSelect"/>                 
                                        </div>
                                    </div>}

                                    { !authenticateUser.IsSuperadmin  && 
                                    <div className="col-12">
                                        <div className="input-group mb-3" style={{flexWrap: 'nowrap'}}>
                                            <div className="input-group-prepend">
                                                <span className="input-group-text" id="basic-addon1"><i className="fas fa-user-plus"></i></span>
                                            </div>
                                            <Select options={[{label:"Delivery", value: "delivery"}, {label:"Booking", value:"booking"}]}
                                                onChange={ (selectedSection) =>  setUserData(userData => ({...userData, Section:selectedSection.value}))}
                                                className="form-select" style={{marginTop: 0}} placeholder="Department"/> 
                                              
                                
                                        </div>
                                    </div>   }


                                    <div className="col-12">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                        <span className="input-group-text" id="basic-addon1"><i className="fas fa-lock"></i></span>
                                        </div>
                                        <input name="password" type="password" value={userData.Password} className="input form-control" id="password" 
                                        placeholder="password" required aria-label="password" aria-describedby="basic-addon1" 
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
                                        placeholder="confirm password" required aria-label="password" aria-describedby="basic-addon1" 
                                        onChange={(e) => setUserData({...userData, Cpassword: e.target.value})}/>
                                        <div className="input-group-append">
                                        <span className="input-group-text" onClick={() => password_show_hide("confirm password")}>
                                            <i className="fas fa-eye" id="confirm password show_eye"></i>
                                            <i className="fas fa-eye-slash d-none" id="confirm password hide_eye"></i>
                                        </span>
                                        </div>
                                    </div>
                                    </div>
                                
                                    <div className="col-12" id="loginbtnDiv">
                                    <button className="btn btn" type="submit" id="signinbtn" name="signin">Create</button>
                                    </div>
                                </div>
                                </form>
                            </div>
                            </div>
                        </div>
                    </Container>
                </CardBody>
            </Card>
        </div>
    );
}

export default CreateUser;