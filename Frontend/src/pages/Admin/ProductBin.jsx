import React, { useState, useEffect } from "react";

const ProductBin = () => {
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    articleName: "",
    image: "",
    articleNo: "",
    mouldingTemp: "",
    fillWeight: "",
    formulationNumber: [],
    mouldNo: "",
    noOfCavity: "",
    cycleTime: "",
    expectedCycles: "",
    noOfLabours: "",
    hardness: "",
    lastUpdated: "",
  });

  const [formulas, setFormulas] = useState([]);
  const [selectedFormulas, setSelectedFormulas] = useState([]);
  const [fillWeights, setFillWeights] = useState({});

  // Fetch formulas from API
  const fetchFormulas = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/formulas");
      const data = await response.json();
      setFormulas(data);
    } catch (error) {
      console.error("Error fetching formulas:", error);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: value,
    });
  };

  // Handle formula selection (checkbox)
  const handleFormulaSelect = (e) => {
    const { value, checked } = e.target;
    setSelectedFormulas((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((id) => id !== value)
    );
  };

  // Handle fill weight change for each selected formula
  const handleFillWeightChange = (e, formulaId) => {
    const weight = e.target.value;
    setFillWeights((prevWeights) => ({
      ...prevWeights,
      [formulaId]: weight,
    }));
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const parseDate = (formattedDate) => {
    if (!formattedDate) return "";
    const [day, month, year] = formattedDate.split("/");
    return `${year}-${month}-${day}`;
  };

  // Add new product to the list (POST request to API)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation (optional)
    if (
      !productForm.articleName ||
      // !productForm.articleNo ||
      // !productForm.mouldingTemp ||
      // !productForm.formulationNumber.length ||
      // !productForm.mouldNo ||
      // !productForm.noOfCavity ||
      // !productForm.cycleTime ||
      // !productForm.expectedCycles ||
      !productForm.noOfLabours ||
      !productForm.hardness ||
      !productForm.lastUpdated
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Ensure fill weights are entered for all selected formulas
    for (const formulaId of selectedFormulas) {
      if (!fillWeights[formulaId]) {
        alert(`Please enter the fill weight for formula ${formulaId}.`);
        return;
      }
    }

    // Combine the selected formulas with their corresponding fill weights
    const finalFormulations = selectedFormulas.map((formulaId) => ({
      formulaId,
      fillWeight: fillWeights[formulaId],
    }));

    // New product data to send to API
    const newProduct = { ...productForm, formulations: finalFormulations };

    try {
      // Send POST request to API to create a new product
      const response = await fetch("http://localhost:5001/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        setProducts((prevProducts) => [...prevProducts, createdProduct]); // Update products list
        alert("Product saved successfully!");
        resetForm();
      } else {
        alert("Error saving product. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Error submitting product.");
    }
  };

  // Reset form fields after submission
  const resetForm = () => {
    setProductForm({
      articleName: "",
      image: "",
      articleNo: "",
      mouldingTemp: "",
      fillWeight: "",
      formulationNumber: [],
      mouldNo: "",
      noOfCavity: "",
      cycleTime: "",
      expectedCycles: "",
      noOfLabours: "",
      hardness: "",
      lastUpdated: "",
    });

    setFillWeights({});
    setSelectedFormulas([]);
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchFormulas();
    fetchProducts();
  }, []);

  return (
    <div className="product-inventory-container">
      <h1 className="text-center text-3xl mb-4">Product Inventory</h1>

      {/* Product Form */}
      <div className="form-container">
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Article Name</label>
            <input
              type="text"
              name="articleName"
              value={productForm.articleName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="image"
              value={productForm.image}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Article No.</label>
            <input
              type="text"
              name="articleNo"
              value={productForm.articleNo}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Moulding Temp (°C)</label>
            <input
              type="number"
              name="mouldingTemp"
              value={productForm.mouldingTemp}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Formula Selection (Checkboxes) */}
          <div className="form-group">
            <label>Select Formulation Number(s)</label>
            <div className="checkbox-container">
              {formulas.map((formula) => (
                <div key={formula._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={formula._id}
                    value={formula._id}
                    checked={selectedFormulas.includes(formula._id)}
                    onChange={handleFormulaSelect}
                  />
                  <label htmlFor={formula._id}>{formula.name}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Display Fill Weights for Selected Formulas */}
          {selectedFormulas.length > 0 && (
            <div className="fill-weight-inputs">
              <h3>Enter Fill Weights for Selected Formulas</h3>
              {selectedFormulas.map((formulaId) => {
                const formula = formulas.find((f) => f._id === formulaId);
                return (
                  <div key={formulaId} className="form-group">
                    <label>Fill Weight for {formula.name}</label>
                    <input
                      type="number"
                      value={fillWeights[formulaId] || ""}
                      onChange={(e) => handleFillWeightChange(e, formulaId)}
                      placeholder={`Enter fill weight for ${formula.name}`}
                      required
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="form-group">
            <label>Mould No.</label>
            <input
              type="text"
              name="mouldNo"
              value={productForm.mouldNo}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>No. of Cavity</label>
            <input
              type="number"
              name="noOfCavity"
              value={productForm.noOfCavity}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Cycle Time (Seconds)</label>
            <input
              type="number"
              name="cycleTime"
              value={productForm.cycleTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>No. of Expected Cycles per 24 hrs</label>
            <input
              type="number"
              name="expectedCycles"
              value={productForm.expectedCycles}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>No. of Labours Required</label>
            <input
              type="number"
              name="noOfLabours"
              value={productForm.noOfLabours}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Hardness</label>
            <input
              type="text"
              name="hardness"
              value={productForm.hardness}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Updated</label>
            <input
              type="date"
              name="lastUpdated"
              value={productForm.lastUpdated}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit">Save Product</button>
        </form>
      </div>

      {/* Product Table */}
      <div className="table-container mt-8">
        <h2 className="text-xl font-bold">Saved Products</h2>
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Article Name</th>
              <th className="border px-4 py-2">Image</th>
              <th className="border px-4 py-2">Article No.</th>
              <th className="border px-4 py-2">Moulding Temp (°C)</th>
              <th className="border px-4 py-2">Formulation Number(s)</th>
              <th className="border px-4 py-2">Mould No.</th>
              <th className="border px-4 py-2">No. of Cavity</th>
              <th className="border px-4 py-2">Cycle Time</th>
              <th className="border px-4 py-2">No. of Cycles per 24 hrs</th>
              <th className="border px-4 py-2">No. of Labours</th>
              <th className="border px-4 py-2">Hardness</th>
              <th className="border px-4 py-2">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{product.articleName}</td>
                <td className="border px-4 py-2">
                  {product.image ? (
                    <img src={product.image} alt="product" width={50} />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td className="border px-4 py-2">{product.articleNo}</td>
                <td className="border px-4 py-2">{product.mouldingTemp}</td>

                <td className="border px-4 py-2">
                  {product.formulations && product.formulations.length > 0
                    ? product.formulations.map((formulation, i) => {
                        const formula = formulas.find(
                          (f) => f._id === formulation.formulaId
                        );
                        return (
                          formula && (
                            <span key={i}>
                              {formula.name} (Fill Weight:{" "}
                              {formulation.fillWeight})
                              {i < product.formulations.length - 1 && ", "}
                            </span>
                          )
                        );
                      })
                    : "No Formulation"}
                </td>

                <td className="border px-4 py-2">{product.mouldNo}</td>
                <td className="border px-4 py-2">{product.noOfCavity}</td>
                <td className="border px-4 py-2">{product.cycleTime}</td>
                <td className="border px-4 py-2">{product.expectedCycles}</td>
                <td className="border px-4 py-2">{product.noOfLabours}</td>
                <td className="border px-4 py-2">{product.hardness}</td>
                <td className="border px-4 py-2">{product.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductBin;
