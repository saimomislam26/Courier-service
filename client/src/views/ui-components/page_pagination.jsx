import React, { useState, useEffect } from 'react'
import _ from "lodash"
import { PAGINATION_LIMIT } from '../../reducer/common'

function Pagination(props) {
    const [parcels, setParcels] = useState({})
    const [currPage, setcurrPage] = useState(1)


    useEffect(() => {
        props.setPageParam(currPage)
    },[currPage])
    
    useEffect(() => {
        setParcels(props.items)
        setcurrPage(props.currPage)
    },[props.items, props.currPage])

    const count = Math.ceil(parcels.next && parcels.next.len / PAGINATION_LIMIT)
    
  
    const pageNo = _.range(1, count + 1)

    const previous = () => {

        if (currPage <= count && currPage > 1) {
            setcurrPage(currPage-1);
            //getData(currPage - 1)

        }
        else {
            setcurrPage(currPage);
            //getData(currPage)
        }
    }

    const next = () => {

        if (currPage < count) {
            setcurrPage(currPage+1);
            //getData(currPage + 1)

        }
        else {
            setcurrPage(currPage);
            //getData(currPage)
        }


    }

    return (
        <div>
  
 
<nav aria-label="Page navigation example" id="paginationDiv">
  <ul class="pagination">
    <li class="page-item" onClick={previous}>
      <a class="page-link" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only" >Previous</span>
      </a>
    </li>
    {

        pageNo.map((val, ind) => {
           
            return (
                <li className={val === currPage ? "page-item active" : "page-item"} key={ind}>
                    <p className="page-link"  onClick={() => props.setPageParam(val)}>
                        {val}
                    </p>
                </li>
            )

        })
    }
    <li class="page-item" onClick={next}>
      <a class="page-link" aria-label="Next" style={{zIndex: '0'}}>
        <span aria-hidden="true" className="">&raquo;</span>
        <span class="sr-only">Next</span>
      </a>
    </li>
  </ul>
</nav>
</div>
    )
}

export default Pagination
