import React,{useState,useContext} from 'react'
import { GlobalContext } from '../context/ProjectContext'
import Header from '../layouts/layout-components/header/header'
import Notification from '../views/ui-components/Notification'
import BeatLoader from 'react-spinners/BeatLoader'

const Login = () => {
    const {storeLoginData, setAlertData} = useContext(GlobalContext)
    const [user,setUser] = useState({
        Username:"",password:""
    })
    const [loading, setLoading] = useState(false)

    const eventHandle = (e)=>{
        let name
        let value
        name=e.target.name;
        value=e.target.value;
        setUser({...user,[name]:value})
    }
    const password_show_hide = () => {
        var x = document.getElementById("password");
        var show_eye = document.getElementById("show_eye");
        var hide_eye = document.getElementById("hide_eye");
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


    const Loggedin =async (e)=>{
        e.preventDefault();
        setLoading(true)
        const {Username,password}=user
        const res = await fetch(`${process.env.REACT_APP_HOST_NAME}userApi/login`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                credentials:'include',
                body: JSON.stringify({
                  Username, password
                })
            })
            const temp = await res.json();
         
            if(res.status===200&&temp){
              setAlertData({message: "Login Successfully", code: "success"})
              storeLoginData(temp)
              setLoading(false)
            }
            else{
              setAlertData({message:temp.message, code:"danger"})
              setLoading(false)
            }

            
    }

    return (
        <div id="main_body">
          <Header />
          <Notification style={'loginArlat'}/>
            {loading ? (<div className="show-pic"><BeatLoader color={"#0178bc"} loading={loading} size={50} /></div>) :<div className="container-fluid">
        <div className="row d-flex justify-content-center align-items-center m-0" >
          <div className="login_oueter">
            <form action="" method="post" id="login" autocomplete="off" className="bg-light border p-3">
              <div className="form-row">
                <h4 className="title my-3">Login For Access</h4>
                <div className="col-12">
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1"><i className="fas fa-envelope"></i></span>
                    </div>
                    <input name="Username" type="text" value={user.Username} class="input form-control" 
                    id="Username" placeholder="Enter Your Username" onChange={eventHandle} />
                  </div>
                </div>
                <div className="col-12">
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1"><i className="fas fa-lock"></i></span>
                    </div>
                    <input name="password" type="password" value={user.password} className="input form-control" id="password" placeholder="Enter Your Password" required="true" aria-label="password" aria-describedby="basic-addon1" onChange={eventHandle}/>
                    <div className="input-group-append">
                      <span className="input-group-text" onClick={password_show_hide}>
                        <i className="fas fa-eye" id="show_eye"></i>
                        <i className="fas fa-eye-slash d-none" id="hide_eye"></i>
                      </span>
                    </div>
                  </div>
                </div>

               
                <div class="col-12" id="loginbtnDiv">
                  <button className="btn btn" type="submit" id="signinbtn" name="signin" onClick={Loggedin}>Login</button>
                </div>

              </div>
            </form>
            
          </div>
        </div>
      </div>}
        </div>
  
        
    )
}

export default Login
