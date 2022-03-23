import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import BeatLoader from 'react-spinners/BeatLoader'
import { useHistory } from "react-router";


const ProductDetails = () => {
  const [product,setProduct] = useState({})
  const [loading, setLoading] = useState(true)
  const {uid} = useParams()
  const history = useHistory()
  

  useEffect(() => {
    setLoading(true)
    fetch(`${process.env.REACT_APP_HOST_NAME}parcelTrack?id=${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setProduct(data.parcel)
          setLoading(false)
        })
  }, [])
  console.log(product);
  return (<>
    {loading ? <div className="show-pic"><BeatLoader color={"#0178bc"} loading={loading} size={50} /></div> :
    
    <div class="main">

      <button className="btn myButtonID" onClick={() => history.goBack()}>Back</button>

      <div class="container dataViewCard">
      <button className=" editDetailsBtn" onClick={() => history.push(`/update-percel/${product.SearchId}`)}>Edit</button>
        <div class="row">
          <div class="dataDiv profile-tab">
            <div class="senderinfo">
              <div class="row">
                <div class="col-md-6">
                  <label>Id:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.SearchId}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Sender Name:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.SenderName}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Sender Number:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.SenderNumber}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Booked from:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.BookedFrom && product.BookedFrom.branch}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Paid amount:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.PaidAmount}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Booking Date:</label>
                </div>
                <div class="col-md-6">
                  <p>{new Date(product.createdAt).toDateString()}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Product type:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.ProductType}</p>
                </div>
                {/* <div class="col-md-6">
                  <p>{product.referance ? product.referance : "No referance Found"}</p>
                </div> */}
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Referance ID:</label>
                </div>
              
                <div class="col-md-6">
                  <p>{product.referance ? product.referance : "No referance Found"}</p>
                </div>
              </div>
            </div>
            <div class="resiverinfo">
     
              <div class="row">
                <div class="col-md-6">
                  <label>Reciver Name:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.RecieverName}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Reciver Number:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.RecieverNumber}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Send To:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.SendTo && product.SendTo.branch}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>payable amount:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.PayableAmount}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Fee:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.Fee}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>On Condition:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.onCondition}</p>
                </div>
              </div>
              {product.status !== "Booked" ? <div class="row">
                <div class="col-md-6">
                  <label>{product.status} Date:</label>
                </div>
                <div class="col-md-6">
                  <p>{new Date(product.updatedAt).toDateString()}</p>
                </div>
              </div> : null}
              <div class="row">
                <div class="col-md-6">
                  <label>Total amount:</label>
                </div>
                <div class="col-md-6">
                  <p>{product.TotalCost}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>}
    </>
  );
};

export default ProductDetails;
