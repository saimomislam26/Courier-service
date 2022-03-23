import React, {useEffect, useState, useContext} from 'react';
import { Row, Col, NavItem, NavLink, Nav } from 'reactstrap';
import { Graph, SubAdminGraph } from '../../components/dashboard';
import Cards from '../ui-components/cards';
import DatePicker from "react-datepicker";
import { GlobalContext } from '../../context/ProjectContext';


const Admin = () => {
    const [dateParam, setDateParam] = useState(new Date())
    const [periodParam, setPeriodParam] = useState("Weekly")
    const [department, setDepartment] = useState("Booked")
    const [data, setData] = useState([])
    const [option, setOption] = useState([])
    const {authenticateUser} = useContext(GlobalContext)

    let y = []

    useEffect(() => {
        setData([])
        y = []
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

        fetch(`${process.env.REACT_APP_HOST_NAME}parcelApi/admin/dashboard/${dateParam}/${periodParam}/${authenticateUser.branch.id}/${department}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            setData(data)
        })
        
    },[periodParam, dateParam, department])

   

    const dashboarSorting = () => {
        return(<>
              <li className="list-inline-item">
                <select className="form-select form-select-sm mt-5 selectinputAll " style={{outline: 'none'}} aria-label=".form-select-sm example" defaultValue={'Weekly'}
                    onChange={(e) => setPeriodParam(e.target.value)} id="selectYear">
                            <option value="Yearly" disabled={periodParam === "Yearly" ? true : false}>Monthly</option>
                            <option value="Monthly" disabled={periodParam === "Monthly" ? true : false}>Daily</option>
                            <option value="Weekly" disabled={periodParam === "Weekly" ? true : false}>This Week</option>
                            
                </select>
                
            </li>
            { periodParam !== "Weekly" && <li className="list-inline-item">
                {periodParam === "Monthly" ?
                    <DatePicker selected={dateParam} onChange={(date) => setDateParam(date)}
                     dateFormat={periodParam === "Monthly" ? "MMMM" : 'yyyy'}
                     showMonthYearPicker
                    />    
               
                    :
                <select className="form-select form-select-sm mt-5" aria-label=".form-select-sm example" defaultValue={"DEFAULT"}
                onChange={(e) => setDateParam(new Date(e.target.value, 1 ,1))}id="Dashboardyearlist">
                            <option value="DEFAULT" disabled hidden style={{olor: '#00b1d5'}}>Select Year</option>
                            {option.map(i => 
                                <option value={i}>{i}</option>
                            )}
                </select>}
            </li>}
        </>)
    }

    const branchDivision = () => {
        return(
            <Nav tabs>
            <NavItem>
              <NavLink
               className={department==="Booked" && "active"}
                onClick={() => setDepartment("Booked")}
              >
                Booking
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
               className={department==="Delivered" && "active"}
                onClick={() => setDepartment("Delivered")}
              >
                Delivery
              </NavLink>
            </NavItem>
          </Nav>
        )
    }


    return (
        <div>
            <Cards dateParam={dateParam} periodParam={periodParam}/>
    
            <Row>
                <Col sm={12} lg={12}>
                    <SubAdminGraph data={data} period={periodParam} sortingParam={dashboarSorting}
                    branchDivision={branchDivision} department={department}/>
                </Col>
            </Row>
        </div >
    );
}

export default Admin;
