import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./addorder.css";

function AddOrder() {
  const [customerName, setCustomerName] = useState("");
  const [itemName, setItemName] = useState("");
  const [weightPerProduct, setWeightPerProduct] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [orderNumber, setOrderNumber] = useState(1);
  const [orderDescription, setOrderDescription] = useState("");

  const printRef = useRef(); // Ref for the printable section

  useEffect(() => {
    // Placeholder for fetching any initial data (e.g., formulas or ingredients)
  }, []);

  // Generate Order ID
  const generateOrderID = () => {
    const date = new Date();
    const dateString = `${String(date.getDate()).padStart(2, "0")}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getFullYear()).slice(-2)}`;

    return `OD${dateString}-${String(orderNumber).padStart(2, "0")}`;
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload the page to restore original content
  };

  // Function to handle submitting the order
  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        orderId: generateOrderID(),
        customerName,
        itemName,
        weightPerProduct,
        quantity,
        deliveryDate,
        remarks,
        orderDescription,
      };

      const response = await axios.post(
        "http://localhost:5001/api/orders",
        orderData
      );
      alert("Order added successfully!");
      console.log(response.data);
      resetForm();
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Failed to add order. Please try again.");
    }
  };

  // Reset form function to clear all fields
  const resetForm = () => {
    setCustomerName("");
    setItemName("");
    setWeightPerProduct(0);
    setQuantity(0);
    setDeliveryDate("");
    setRemarks("");
    setOrderDescription("");
    setOrderNumber((prev) => prev + 1); // Increment order number for the next order
  };

  return (
    <div className="add-order-container">
      <div className="add-order-content" ref={printRef}>
        <h2>Order Input Page</h2>

        <div>
          <label>Order ID:</label>
          <p>{generateOrderID()}</p>
        </div>

        <div>
          <label htmlFor="customerName">Customer Name:</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label htmlFor="itemName">Item Name:</label>
          <input
            id="itemName"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
          />
        </div>

        <div>
          <label htmlFor="weightPerProduct">Fill Weight (kg):</label>
          <input
            id="weightPerProduct"
            type="number"
            value={weightPerProduct}
            onChange={(e) => setWeightPerProduct(Number(e.target.value))}
          />
        </div>

        <div>
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div>
          <label htmlFor="orderDescription">Order Description:</label>
          <textarea
            id="orderDescription"
            value={orderDescription}
            onChange={(e) => setOrderDescription(e.target.value)}
            placeholder="Enter order description"
            rows="3"
          />
        </div>

        <div>
          <label htmlFor="deliveryDate">Delivery Date:</label>
          <input
            id="deliveryDate"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="remarks">Remarks:</label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter any remarks"
            rows="3"
          />
        </div>

        <h3>Summary</h3>
        <p>Item Name: {itemName}</p>
        <p>Order Description: {orderDescription}</p>
        <p>Delivery Date: {deliveryDate}</p>
        <p>Remarks: {remarks}</p>

        <button onClick={handlePrint}>Print</button>
        <button onClick={resetForm}>Clear</button>
        <button onClick={handleSubmitOrder}>Add Order to Production</button>
      </div>
    </div>
  );
}

export default AddOrder;
