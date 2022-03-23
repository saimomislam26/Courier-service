import React, {useState, useEffect, useContext} from "react";

import {
    Card, Popover, PopoverBody,PopoverHeader,
    CardBody,
    CardTitle,
} from 'reactstrap';
import Chart from 'react-apexcharts';


const SubAdminGraph = (props) => {
    const [data, setData] = useState({onCondition:[], payableAmount:[], fee:[], paidAmount:[],
        totalCost:[]})
    const [customGraph, setCustomGraph] = useState("All")
    const [popoverStatus, setPopoverStatus] = useState(false)
    const [modalData, setModalData] = useState([])
    const mnth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = []
    const week = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ]
    const column = props.period === "Monthly" ? 31 : props.period === "Weekly" ? 7 : 12; 
     
    for(let i=1;i<=31; i++)
        day.push(i)

    let zero = new Array(column).fill(0)
    
    
    let onCondition = new Array(column).fill(0)
    let payableAmount = new Array(column).fill(0)
    let fee = new Array(column).fill(0)
    let paidAmount = new Array(column).fill(0)
    let totalCost = new Array(column).fill(0)
        
    useEffect(() => {
        props.data.forEach(i => {
            let x = props.period === "Weekly" ? new Date(i.week_day).getDay() +2 : parseInt(i.week_day.slice(-2))
            if(props.period === "Weekly"){
                if(x === 9) x = 1
                if(x === 8) x = 7
            }
            console.log(x);
            onCondition[x-1] = i.onCondition || 0
            payableAmount[x-1] = i.PayableAmount || 0
            fee[x-1] = i.Fee || 0
            paidAmount[x-1] = i.PaidAmount || 0
            totalCost[x-1] = i.TotalCost || 0
        });
        setData({onCondition, payableAmount, fee, paidAmount, totalCost})
    }, [props.data])

    const series = [
        {
            name: "On Condition",
            data: customGraph === "All" || customGraph === "onCondition" ? data.onCondition : zero
        },
        {
            name: "Due",
            data: customGraph === "All" || customGraph === "payableAmount" ? data.payableAmount : zero
        },
        // {
        //     name: "Total Cost",
        //     data: customGraph === "All" || customGraph === "totalCost" ? data.totalCost : zero
        // }
    ];

    props.department === "Booked" && series.unshift({
        name: "Paid",
        data: customGraph === "All" || customGraph === "paidAmount" ? data.paidAmount : zero
    })
    
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
        colors: ['#00b4d8', '#48cae4', '#ade8f4', '#076173', '#72a1ab'],
        xaxis: {
            categories: props.period === "Monthly" ? day : props.period === "Weekly" ? week : mnth
        },
        yaxis: {
            title: {
              text: '$ (taka)'
            }
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
        ],
        tooltip: {
            shared: true,
            intersect: false
          }
    };


    const radioChange = (event) => {
        setCustomGraph(event.target.value)
    }



    return (
        <div style={{overflow: 'auto'}}>
        <div className="graphResponsive">
        <Card className="card graphbody">
            
            <CardBody className="card-body">
                { props.branchDivision()  }
                <div className="d-md-flex align-items-center">
                    <CardTitle className="card-title">Graph</CardTitle>
                    <div className="ml-auto">
                        <ul className="list-inline">
                            {props.sortingParam()}

                            <li className="list-inline-item">
                                <input type="radio" name="radio" className="mr-1" style={{ color: '#51bdff' }} value="payableAmount"
                                onChange={(e) => radioChange(e)} />
                                <label className="" style={{color: '#017abd'}} id="Due">Due
                                    <span class="checkmark"></span>
                                </label>
                            </li>

                            <li className="list-inline-item">
                                <input type="radio" className="mr-1" style={{ color: '#51bdff' }} name="radio" value="onCondition"
                                onChange={(e) => radioChange(e)}/>
                                <label class="" style={{color: '#017abd'}} id="onCondition">On Condition
                                    <span class="checkmark"></span>
                                </label>
                            </li>

                            { props.department === "Booked" && <li className="list-inline-item">
                                <input type="radio" className="mr-1" style={{ color: '#51bdff' }} name="radio" value="paidAmount"
                                onChange={(e) => radioChange(e)} />
                                <label class="" style={{color: '#017abd'}} id="Paid">Paid
                                    <span class="checkmark"></span>
                                </label>
                            </li>}

                            <li className="list-inline-item">
                                <input type="radio" name="radio" className="mr-1" style={{ color: '#51bdff' }} value="All"
                                onChange={(e) => radioChange(e)}/>
                                <label className="" style={{color: '#017abd'}} id="All"
                                >All
                                    <span class="checkmark"></span>
                                </label>
                            </li>
                            
                        </ul>
                    </div>
                </div>
                <div className="clear"></div>
                <div className="total-sales" style={{ height: '339px' }} id="chart">
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

export default SubAdminGraph;
