import React, { useState, useEffect } from "react";

const ProductBin = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
 


  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Sorting logic
  const sortProducts = (products, config) => {
    if (config === null) return products;

    const sortedProducts = [...products];
    sortedProducts.sort((a, b) => {
      if (a[config.key] < b[config.key]) return config.direction === "ascending" ? -1 : 1;
      if (a[config.key] > b[config.key]) return config.direction === "ascending" ? 1 : -1;
      return 0;
    });

    return sortedProducts;
  };

  // Handle sort button click
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    return (
      product.articleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.articleNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const [productForm, setProductForm] = useState({
    articleName: '',
    image: '',
    articleNo: '',
    manufacturing: '', // Initialize manufacturing field
    mouldingTemp: '',
    formulations: [],
    mouldNo: '',
    noOfCavity: '',
    cycleTime: '',
    expectedCycles: '',
    noOfLabours: '',
    hardness: '',
    lastUpdated: new Date().toISOString().split("T")[0], // Automatically set the date
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
      const productsData = await response.json();
      
      // Fetch all unique formula IDs from the products
      const formulaIds = productsData.flatMap(product =>
        product.formulations.map(formulation => formulation.formulaName)
      );
      
      // Remove duplicate formula IDs
      const uniqueFormulaIds = [...new Set(formulaIds)];
  
      // Fetch all formulas at once by their IDs
      const formulaResponse = await fetch(
        `http://localhost:5001/api/formulas?ids=${uniqueFormulaIds.join(",")}`
      );
      const formulasData = await formulaResponse.json();
  
      // Create a map of formula ID to full formula data
      const formulaMap = formulasData.reduce((acc, formula) => {
        acc[formula._id] = formula;
        return acc;
      }, {});
  
      // Merge formula data with each product's formulations
      const populatedProducts = productsData.map((product) => ({
        ...product,
        formulations: product.formulations.map((formulation) => ({
          ...formulation,
          formulaName: formulaMap[formulation.formulaName], // Add full formula data
        })),
      }));
  
      setProducts(populatedProducts); // Set the populated products data
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
  
    // Ensure fill weights are entered for all selected formulas
    for (const formulaName of selectedFormulas) {
      if (!fillWeights[formulaName]) {
        alert(`Please enter the fill weight for formula ${formulaName}.`);
        return;
      }
    }
  
    // Combine the selected formulas with their corresponding fill weights
    const finalFormulations = selectedFormulas.map((formulaName) => ({
      formulaName,  // Assuming formulaName corresponds to the actual formula name (ID or string)
      fillWeight: Number(fillWeights[formulaName]),  // Ensure fillWeight is a number
    }));
  
    // Create the new product data object
    const newProduct = { 
      ...productForm, 
      formulations: finalFormulations 
    };
  
    // Ensure all required fields are populated
    if (!newProduct.articleName || !newProduct.articleNo || !newProduct.manufacturing) {
      alert("Please ensure all required fields (articleName, articleNo, manufacturing) are filled.");
      return;
    }
  
    try {
      // Send POST request to API to create a new product
      const response = await fetch("http://localhost:5001/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });
  
      console.log("Product data being sent:", newProduct);
      console.log("Response from API:", response);
  
      if (response.ok) {
        const createdProduct = await response.json();
        setProducts((prevProducts) => [...prevProducts, createdProduct]); // Update products list
        alert("Product saved successfully!");
        resetForm();
      } else {
        // Log the error response and alert the user
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse);
        alert(`Error saving product: ${errorResponse.error || "Unknown error"}`);
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
    setSelectedFormulas([]);  // Reset selected formulas
  };
  

  // Fetch data when component mounts
  useEffect(() => {
    fetchFormulas();
    fetchProducts();
  }, []);

  return (
    <div className="product-inventory-container">
      <h1 className="text-center text-3xl mb-4">Product Bin</h1>

      {/* Product Form */}
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

  <label htmlFor="manufacturing">Type of manufacturing</label>
  <select
    name="manufacturing"
    id="manufacturing"
    value={productForm.manufacturing}
    onChange={handleInputChange}
  >
    <option value="">Select Manufacturing Type</option>
    <option value="Moulding">Moulding</option>
    <option value="Extrusion">Extrusion</option>
  </select>

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

  {/* Show Moulding Temp only if Moulding is selected */}
  {productForm.manufacturing === 'Moulding' && (
    <div className="form-group">
   <label>Moulding Temp UT-LT(°C)</label>
<input
  type="text"
  name="mouldingTemp"
  value={productForm.mouldingTemp}
  onChange={handleInputChange}
  required
  pattern="^\d+(\.\d{1,2})?-\d+(\.\d{1,2})?$" // Regular expression to match number-number (e.g., 200-250 or 200.5-250.75)
  title="Please enter the temperature in the format UT-LT, e.g., 200-250"
  placeholder="e.g., 200-250"
/>

    </div>
  )}

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

  {/* Show Mould No. and No. of Cavity only if Moulding is selected */}
  {productForm.manufacturing === 'Moulding' && (
    <>
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
    </>
  )}

  <div className="form-group">
    <label>{productForm.manufacturing === 'Extrusion' ? 'Expected production per hour' : 'No. of Expected Cycles per 24 hrs'}</label>
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
  disabled
/>
  </div>

  <button type="submit">Save Product</button>
</form>


      {/* Product Table */}
      <div className="table-container mt-8">
  <h2 className="text-xl font-bold">Saved Products</h2>
  {/* Search Input */}
  <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="mb-4 p-2 border border-gray-300"
      />
  <table className="table-auto w-full border-collapse">
  <thead>
    <tr>
      <th className="border px-4 py-2" onClick={() => handleSort("articleName")}>
        Article Name
      </th>
      <th className="border px-4 py-2">Image</th>
      <th className="border px-4 py-2" onClick={() => handleSort("articleNo")}>
        Article No.
      </th>
      <th className="border px-4 py-2" onClick={() => handleSort("manufacturing")}>
        Manufacturing Type
      </th>
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
    {sortProducts(paginatedProducts, sortConfig).map((product, index) => (
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
        <td className="border px-4 py-2">{product.manufacturing}</td>
        <td className="border px-4 py-2">
          {product.manufacturing === "Moulding" ? product.mouldingTemp : "N/A"}
        </td>
        <td className="border px-4 py-2">
          {product.formulations && product.formulations.length > 0
            ? product.formulations.map((formulation, i) => (
                <span key={i}>
                  {formulation?.formulaName?.name} (Fill Weight: {formulation?.fillWeight})
                  {i < product.formulations.length - 1 && ", "}
                </span>
              ))
            : "No Formulation"}
        </td>
        <td className="border px-4 py-2">{product.mouldNo || "N/A"}</td>
        <td className="border px-4 py-2">
          {product.manufacturing === "Moulding" ? product.noOfCavity : "N/A"}
        </td>
        <td className="border px-4 py-2">
          {product.manufacturing === "Moulding" ? product.cycleTime : "N/A"}
        </td>
        <td className="border px-4 py-2">{product?.expectedCycles}</td>
        <td className="border px-4 py-2">{product?.noOfLabours}</td>
        <td className="border px-4 py-2">{product?.hardness}</td>
        <td className="border px-4 py-2">
          {new Date(product.lastUpdated).toLocaleDateString()}
        </td>
      </tr>
    ))}
  </tbody>
</table>


</div>

    </div>
  );
};

export default ProductBin;
