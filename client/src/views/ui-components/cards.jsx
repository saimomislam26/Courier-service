import React, { useEffect, useState, useContext } from 'react';
import Select from 'react-select';
import {
    Card,
    Row,
    Col
} from 'reactstrap';
import { GlobalContext } from '../../context/ProjectContext';

const Cards = (props) => {
    const [time, setTime] = useState(Date.now())
    const [data, setData] = useState([])
    const [branch, setBranch] = useState([])
    const {authenticateUser} = useContext(GlobalContext)
    const[selectBranch,setSelectBranch]=useState(authenticateUser.IsSuperadmin ? "All" : authenticateUser.branch.id)

    
    useEffect(() => {
        const getBranchName = async () => {
            const res = await fetch(`${process.env.REACT_APP_HOST_NAME}branchApi/getBranch`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
    
            const temp = await res.json()
            let test = [];
            test = temp.map((branch, key) => ({value:branch._id, label:branch.branch}))
            test.unshift({value: "All", label:"All"})
            setBranch(test)
        }
        getBranchName()
    },[])
    

    const getData = async() => {
        let url = `${process.env.REACT_APP_HOST_NAME}parcelApi/admin/dashboard/cardBranch/new/${selectBranch}/${props.dateParam}/${props.periodParam}`
        let all_url = `${process.env.REACT_APP_HOST_NAME}parcelApi/admin/dashboard/cardAll/totalshow/${props.dateParam}/${props.periodParam}`
        const res1 = await fetch(selectBranch === "All" ? all_url : url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const temp1 = await res1.json()
        console.log(res1, temp1);
        if(temp1.message){
            setData([])
        } else setData(temp1)
    }


    useEffect(() => {
        getData()
    }, [authenticateUser.branch, selectBranch, props.dateParam, props.periodParam])

    const changeBranchparam = (branch) => {
        setSelectBranch(branch)
        props.passBranch(branch)
    }

    return (
        <div>
        <div className="BranchShowDiv">
            {authenticateUser.IsSuperadmin && <>
                <Select className="form-select form-select-sm mt-5" options={branch} 
                onChange={ (selectedBranch) => changeBranchparam(selectedBranch.value)}
                defaultValue={{label: "All", value:"All"}}/>
            </>
                
            }
            </div>
            <Row>
                <Col xs="12" sm="6" md="6" lg="3">
                   
                    <Card body className="bodyDiv" style={{zIndex: '0'}}>
                    <div className="card_datadiv">
                    <div>
                    <h3>Waiting to Dispatch</h3>
                    <p style={{textAlign: 'center'}}>{data.filter(i => i.status === 'Booked').map(i => i.Total)[0] || 0}</p>
                    </div>
                    <div>
                    <i class="fas fa-cart-arrow-down dataicon"></i>
                    
                    </div>
                    </div>


                    </Card>
                </Col>
                <Col xs="12" sm="6" md="6" lg="3">
                    {/* --------------------------------------------------------------------------------*/}
                    {/* Card-1*/}
                    {/* --------------------------------------------------------------------------------*/}
                    <Card body className="bodyDiv">
                    <div className="card_datadiv">
                    <div>
                    <h3>Waiting to be Delivered</h3>
                    <p style={{textAlign: 'center'}}>{data.filter(i => i.status === 'Recieved').map(i => i.Total)[0] || 0}</p>
                    </div>
                    <div>
                    
                  
                    <i class="fas fa-dumpster dataicon"></i>
                     </div>
                    </div>

                    </Card>
                </Col>

                <Col xs="12" sm="6" md="6" lg="3" >
                    {/* --------------------------------------------------------------------------------*/}
                    {/* Card-1*/}
                    {/* --------------------------------------------------------------------------------*/}
                    <Card body className="bodyDiv">

                       
                       
                        <div className="card_datadiv">
                        <div>
                        <h3>Waiting to be Recieved</h3>
                        <p style={{textAlign: 'center'}}>{data.filter(i => i.status === 'Sent').map(i => i.Total)[0] || 0}</p>
                        </div>
                        <div>
                        <i class="fas fa-truck dataicon"></i>
                        </div>
                        </div>

                    </Card>
                </Col>

                <Col xs="12" sm="6" md="6" lg="3">
                    {/* --------------------------------------------------------------------------------*/}
                    {/* Card-1*/}
                    {/* --------------------------------------------------------------------------------*/}
                    <Card body className="bodyDiv">
                    <div className="card_datadiv">
                    <div>
                    <h3>Delivered</h3>
                    <p style={{textAlign: 'center'}}>{data.filter(i => i.status === 'Delivered').map(i => i.Total)[0] || 0}</p>
                    </div>
                    <div>
                    <i class="fas fa-clipboard-check dataicon deliveredIconP"></i>
                    </div>
                    </div>

                    </Card>
                </Col>

       
            </Row>
            

        </div>
        
    );
}

export default Cards;


