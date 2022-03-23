import React, {useEffect, useState} from 'react';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import { SubAdminGraph } from '../../components/dashboard';
import Cards from '../ui-components/cards';
import DatePicker from "react-datepicker";

const SuperAdmin = () => {
    const [amount, setAmount] = useState([])
    const [branchParam, setBranchParam] = useState("all")
    const [dateParam, setDateParam] = useState(new Date())
    const [periodParam, setPeriodParam] = useState("Weekly")
    const [branchDiv, setBranchDiv] = useState("Booked")
    const [option, setOption] = useState([])

    useEffect(() => {
        let y = []
        fetch(`${process.env.REACT_APP_HOST_NAME}firstData/year`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            for(let i=data; i<=new Date().getFullYear();i++)
               y.push(i)
            setOption(y)
        })
    },[])
    
    useEffect(() => {
        console.log(dateParam);
        { branchParam !== "all" ? getBranchData() :
            fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/admin/dashboard/allBranch/${dateParam}/${periodParam}/${branchDiv}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
                setAmount(data);
            }) 
        }
       
    }, [periodParam, dateParam, branchDiv, branchParam])


    const getBranchData = () => {
        fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/admin/dashboard/${dateParam}/${periodParam}/${branchParam}/${branchDiv}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            setAmount(data)
        })
    }

    const getBranch = (branch) => {
        setBranchParam(branch)
    }

    const branchDivision = () => {
        return(
            <Nav tabs>
            <NavItem>
              <NavLink
               className={branchDiv==="Booked" && "active"}
                onClick={() => setBranchDiv("Booked")}
              >
                Booking
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
               className={branchDiv==="Delivered" && "active"}
                onClick={() => setBranchDiv("Delivered")}
              >
                Delivery
              </NavLink>
            </NavItem>
          </Nav>
        )
    }
    
    const dashboarSorting = () => {
        return(<>
            <li className="list-inline-item">
                <select className="form-select form-select-sm mt-5 selectinputAll" style={{outline: 'none'}} aria-label=".form-select-sm example" defaultValue={'Weekly'}
                    onChange={(e) => setPeriodParam(e.target.value)} id="selectYear">
                            <option value="Weekly" disabled={periodParam === "Weekly" ? true : false}>This Week</option>
                            <option value="Yearly" disabled={periodParam === "Yearly" ? true : false}>Monthly</option>
                            <option value="Monthly" disabled={periodParam === "Monthly" ? true : false}>Daily</option>
                </select>
                
            </li>
            { periodParam !== "Weekly" && <li className="list-inline-item">
            {periodParam === "Monthly" ?
                    <DatePicker selected={dateParam} onChange={(date) => setDateParam(date)}
                     dateFormat={periodParam === "Monthly" ? "MMMM" : 'yyyy'}
                     showMonthYearPicker
                    />    
               
                    :
                <select className="form-select form-select-sm mt-5" aria-label=".form-select-sm example" defaultValue={"DEFAULT"} id="Dashboardyearlist"
                onChange={(e) => setDateParam(new Date(e.target.value, 1 ,1))}>
                            <option value="DEFAULT" disabled hidden style={{olor: '#00b1d5'}}>Select Year</option>
                            {option.map(i => 
                                <option value={i} >{i}</option>
                            )}
                </select>}
            </li> }
        </>)
    }

    return (
        <div>
        <Cards passBranch={getBranch} dateParam={dateParam} periodParam={periodParam}/>
        <Row>
            <Col sm={12} lg={12}>
                <SubAdminGraph data={amount} period={periodParam} sortingParam={dashboarSorting} 
                        branchDivision={branchDivision} department={branchDiv}/>
            </Col>
        </Row>
    </div >
    );
}

export default SuperAdmin;
