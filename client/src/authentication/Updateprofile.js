import React,{useContext,useState,useEffect} from 'react'
import { GlobalContext } from '../context/ProjectContext'
import test from '../assets/images/test.jpg'
import Select from 'react-select';
import BeatLoader from 'react-spinners/BeatLoader'


const Updateprofile = () => {
    const {authenticateUser, updateUser, setAlertData} = useContext(GlobalContext)
    const [user,setUser] = useState({
        Username:"", Email:"",branch:"", Password:"", Cpassword:""
    })
    const [branchName,setBranch]=useState([])
    const [loading, setLoading] = useState(false)
    const [updateToggle,setUpdateToggle] = useState(true)

    const updateInfo =()=>{
        setUpdateToggle(false)
    }

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

    useEffect(() => {
        setUser({Username:authenticateUser.Username,Email:authenticateUser.Email,branch:authenticateUser.branch.id})
    }, [authenticateUser.Email])
 
    const eventHandle = (e)=>{
        let name
        let value
        name=e.target.name;
        value=e.target.value;
        setUser({...user,[name]:value})
    }
    console.log(user);

    const updatedProfile =async ()=>{
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}userApi/user/update/${authenticateUser._id}`, {
                method: "PUT",
                headers: {
                    // 'Accept':"application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...user
                })
            }) 
        
        const temp = await res.json()
        console.log(temp);
        if(res.status===200 && temp){
            setAlertData({message:"User update Successfully", code:"success"})
           updateUser(temp)
            setUpdateToggle(true)
            
        } else {
            setAlertData({message:temp.message, code:"danger"})
            //setUser()
        } 
    }


    if(updateToggle){
        return (
            <div class="main">
            {!authenticateUser.Email ? <div className="show-pic"><BeatLoader color={"#0178bc"} loading={true} size={50} /></div> :
            <div class="container emp-profile">
               
                    <div class="row">
                        <div class="col-md-4">
                            <div class="profile-img">
                                <img src={test} alt="" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="profile-head">
         
                                <ul class="nav nav-tabs" id="myTab" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">About</a>
                                    </li>
    
                                </ul>
                            </div>
                            <div class="tab-content profile-tab" id="myTabContent">
                                <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <label>User Id</label>
                                        </div>
                                        <div class="col-md-6">
                                            <p>{authenticateUser._id}</p>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <label>Username</label>
                                        </div>
                                        <div class="col-md-6">
                                            <p>{authenticateUser.Username}</p>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <label>Name</label>
                                        </div>
                                        <div class="col-md-6">
                                            <p>{authenticateUser.Email}</p>
                                        </div>
                                    </div>

                                  {!(authenticateUser.IsSuperadmin || authenticateUser.IsAdmin) && <div class="row">
                                        <div class="col-md-6">
                                            <label>Department</label>
                                        </div>
                                        <div class="col-md-6">
                                            <p>{authenticateUser.Section[0].toUpperCase()}{authenticateUser.Section.substring(1)}</p>
                                        </div>
                                    </div>}
                                    
                                    {authenticateUser.IsSuperadmin || <div class="row">
                                        <div class="col-md-6">
                                            <label>Branch</label>
                                        </div>
                                        <div class="col-md-6">
                                            <p>{authenticateUser.branch.branch}</p>
                                        </div>
                                    </div> }

                                    
                                </div>
    
                            </div>
                        </div>
                       <div class="col-md-2">
                            <input type="submit" class="profile-edit-btn" name="btnAddMore" value="Edit Profile" onClick={updateInfo}/>
                        </div>
                    </div>
           
            </div> }
        </div>
        )
    }
    else{
        return (
        <div class="main">
            <div class="container emp-profile">
                
                    <div class="row">
                        <div class="col-md-4">
                            <div class="profile-img">
                                <img src={test} alt="" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="profile-head">

                                <ul class="nav nav-tabs" id="myTab" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">About</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="tab-content profile-tab" id="myTabContent">
                                <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">

                                    <div class="row inputMt">
                                        <div class="col-md-6">
                                            <label>Username</label>
                                        </div>
                                        <div class="col-md-6">
                                        <input name="Username" type="text" value={user.Username} class="input form-control" id="eamil" placeholder="Enter Your Name" aria-label="Username" aria-describedby="basic-addon1" onChange={eventHandle} />
                                            {/* <p>{Username}</p> */}
                                        </div>
                                    </div>
                                  
                                    <div class="row inputMt">
                                        <div class="col-md-6">
                                            <label>Name</label>
                                        </div>
                                        <div class="col-md-6">
                                        <input name="Email" type="email" value={user.Email} class="input form-control" id="eamil" placeholder="Enter Your Name"
                                         aria-label="Username" aria-describedby="basic-addon1" onChange={eventHandle} />
                                            {/* <p>{Email}</p> */}
                                        </div>
                                    </div>

                                

                                    <div className="col-12 updateP">
                                        <div className="input-group inputMt">
                                        <div class="col-md-6 updateP">
                                            <label>Password</label>
                                        </div>
                                            <input name="Password" type="password" className="input form-control" id="password" 
                                                placeholder="password" aria-label="password" aria-describedby="basic-addon1" 
                                                onChange={eventHandle}/>
                                            <div className="input-group-append">
                                            <span className="input-group-text" onClick={() => password_show_hide("password")}>
                                                <i className="fas fa-eye" id="password show_eye"></i>
                                                <i className="fas fa-eye-slash d-none" id="password hide_eye"></i>
                                            </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-12 updateP">
                                        <div className="input-group inputMt">
                                        <div class="col-md-6 updateP">
                                            <label>Confirm Password</label>
                                        </div>
                                            <input name="Cpassword" type="password" className="input form-control" id="confirm password" 
                                            placeholder="confirm password" aria-label="password" aria-describedby="basic-addon1" 
                                            onChange={eventHandle}/>
                                            <div className="input-group-append">
                                            <span className="input-group-text" onClick={() => password_show_hide("confirm password")}>
                                                <i className="fas fa-eye" id="confirm password show_eye"></i>
                                                <i className="fas fa-eye-slash d-none" id="confirm password hide_eye"></i>
                                            </span>
                                            </div>
                                        </div>  
                                    </div> 

                                    <div class="row mt-3" style={{float: 'right'}}>
                                    <div className="profilbtn">
                {/* <input type="submit" class="profile-edit-btn" name="btnAddMore" value="Edit Profile" onClick={updateInfo}/> */}
                                        <button className="btn btn-primary" onClick={updatedProfile} style={{marginRight:'1rem'}}>Update</button>
                                        <button className="btn btn-primary" onClick={() => setUpdateToggle(true)}>Cancel</button>

                                     </div>
                                    </div>
                        
                                </div>

                            </div>
                        </div>
                    </div>
                    
              


            </div>
          
            {/* <div class="col-md-2">
            </div> */}
        </div>
        
        )

    }

    
    
}

export default Updateprofile