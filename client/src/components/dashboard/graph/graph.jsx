import React, {useState, useEffect, useContext} from "react";

import {
    Card, Popover, PopoverBody,PopoverHeader,
    CardBody,
    CardTitle
} from 'reactstrap';
import DatePicker from "react-datepicker";

import Chart from 'react-apexcharts';
import { GlobalContext } from "../../../context/ProjectContext";

const Graph = (props) => {
    const [delivered, setDelivered] = useState([])
    const [paid, setPaid] = useState([])
    const [payable, setPayable] = useState([])
    const [popoverStatus, setPopoverStatus] = useState({status:false, target:"All"})
    const [customGraph, setCustomGraph] = useState("All")
    const {authenticateUser} = useContext(GlobalContext)
    
    const mnth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = []
    const column = props.period === "Monthly" ? 31 : 12; 

    for(let i=1;i<=31; i++)
        day.push(i)

    let zero = new Array(column).fill(0)
    
    
    let d = new Array(column).fill(0)
    let p = new Array(column).fill(0)
    let pa = new Array(column).fill(0)
   console.log(props.data, "fafadf");
    useEffect(() => {
        props.data.forEach(i => {
            let x =  props.period === "Monthly" ? parseInt(i.week_day.slice(-2)) : parseInt(i.week_day.slice(-2))
            d[x-1] = i.Delivered
            p[x-1] = i.PaidAmount 
            pa[x-1] = i.PayableAmount || 0
        });
        setDelivered(d)
        setPaid(p)
        setPayable(pa)
    }, [props.data])

    
    const options = {
        chart: {
            toolbar: {
                show: false
            },
            stacked: true,
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 4,
            colors: ['transparent']
        },
        legend: {
            show: false
        },
        plotOptions: {
            bar: {
                horizontal: false,
                endingShape: 'flat'
            },
        },
        colors: ['#00b4d8', '#48cae4', '#ade8f4'],
        xaxis: {
            categories: props.period === "Monthly" ? day: mnth
        },
        responsive: [
            {
                breakpoint: 2500,
                options: {
                    plotOptions: {
                        bar: {
                            columnWidth: '30%',
                        }
                    }
                }
            }
        ]
    };
    const series = [
        {
            name: authenticateUser.IsAdmin ? "Delivered" : authenticateUser.IsSuperadmin && "Booked",
            //data: [800000, 1200000, 1400000, 1300000, 1200000, 1400000, 1300000, 1300000, 1200000]
            data: customGraph === "All" || customGraph === "Delivered" ? delivered : zero
        },
        {
            name: "Paid",
            //data: [200000, 400000, 500000, 300000, 400000, 500000, 300000, 300000, 400000]
            data: customGraph === "All" || customGraph === "Paid" ? paid : zero
        },
        {
            name: "Payable",
            //data: [100000, 200000, 400000, 600000, 200000, 400000, 600000, 600000, 200000]
            data: customGraph === "All" || customGraph === "Payable" ? payable : zero
        }
    ];
    const radioChange = (event) => {
        setCustomGraph(event.target.value)
    }

    const openModal = (id="All") => (setPopoverStatus({status:!popoverStatus.status, target:id}))

    const hoverData = () => (
        <Popover placement="auto" isOpen={popoverStatus.status} target={popoverStatus.target} toggle={openModal}>
            <PopoverHeader>Popover Title</PopoverHeader>
            <PopoverBody>Sed posuere consectetur est at lobortis. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</PopoverBody>
        </Popover>
    )
    return (
        <div style={{overflow: 'auto'}}>
        <div className="graphResponsive">
        <Card className="card">
            
            <CardBody className="card-body">
                {/* { props.branchDivision()  } */}
                <div className="d-md-flex align-items-center">
                    <CardTitle className="card-title">Total Revenue</CardTitle>
                    <div className="ml-auto">
                        <ul className="list-inline">
                            {props.sortingParam()}

                            <li className="list-inline-item">
                                <input type="radio" className="mr-1" style={{ color: '#51bdff' }} name="radio" value="Delivered"
                                onChange={(e) => radioChange(e)}/>
                                <label class="" style={{color: '#017abd'}} id="Delivered" onMouseEnter={() => openModal("Delivered")} onMouseLeave={() => openModal("Delivered")}>Delivered
                                    <span class="checkmark"></span>
                                </label>
                            </li>
                            {hoverData()}
                            <li className="list-inline-item">
                                <input type="radio" className="mr-1" style={{ color: '#51bdff' }} name="radio" value="Paid"
                                onChange={(e) => radioChange(e)} />
                                <label class="" style={{color: '#017abd'}} id="Paid" onMouseEnter={() => openModal("Paid")} onMouseLeave={() => openModal("Paid")}>Paid
                                    <span class="checkmark"></span>
                                </label>
                            </li>

                            <li className="list-inline-item">
                                <input type="radio" name="radio" className="mr-1" style={{ color: '#51bdff' }} value="Payable"
                                onChange={(e) => radioChange(e)} />
                                <label className="" style={{color: '#017abd'}} id="Payable" onMouseEnter={() => openModal("Payable")} onMouseLeave={() => openModal("Payable")}>Payable
                                    <span class="checkmark"></span>
                                </label>
                            </li>

                            <li className="list-inline-item">
                                <input type="radio" name="radio" className="mr-1" style={{ color: '#51bdff' }} value="All"
                                onChange={(e) => radioChange(e)}/>
                                <label className="" style={{color: '#017abd'}} id="All" onMouseEnter={() => openModal("All")} onMouseLeave={() => openModal("All")}>All
                                    <span class="checkmark"></span>
                                </label>
                            </li>
                            
                        </ul>
                    </div>
                </div>
                <div className="clear"></div>
                <div className="total-sales" style={{ height: '339px' }}>
                    <Chart
                        options={options}
                        series={series}
                        type="bar"
                        height="339"
                    />
                </div>
            </CardBody>
        </Card>
        </div>
        </div>

    );
}

export default Graph;
