import React, { useState, useEffect } from "react";
import axios from "axios";

const FormulaBin = () => {
  const [formulas, setFormulas] = useState([]);
  const [currentFormulaName, setCurrentFormulaName] = useState("");
  const [currentIngredients, setCurrentIngredients] = useState([]);
  const [lotMultiplier, setLotMultiplier] = useState(""); // Store lot number for the formula
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null); // Track the formula ID when editing
  const [rubberIngredients, setRubberIngredients] = useState([]);
  const [chemicalIngredients, setChemicalIngredients] = useState([]);

  // Fetch formulas and items (ingredients) from the backend
  useEffect(() => {
    fetchFormulas();
    fetchIngredients();
  }, []);

  const fetchFormulas = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/formulas");
      setFormulas(response.data);
    } catch (error) {
      console.error("Error fetching formulas:", error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/items");
      const rubber = response.data.filter((item) => item.category === "rubber");
      const chemicals = response.data.filter(
        (item) => item.category === "chemical"
      );
      setRubberIngredients(rubber);
      setChemicalIngredients(chemicals);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const addRow = () => {
    setCurrentIngredients([
      ...currentIngredients,
      { type: "rubber", name: "", ratio: 0, phr: 0, consumption: 0 },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedIngredients = [...currentIngredients];
    updatedIngredients[index][field] = value;

    // Update consumption based on weight
    if (field === "ratio") {
      updatedIngredients[index].consumption =
        updatedIngredients[index].ratio * lotMultiplier;
    }

    setCurrentIngredients(updatedIngredients);
  };

  const removeRow = (index) => {
    const updatedIngredients = [...currentIngredients];
    updatedIngredients.splice(index, 1);
    setCurrentIngredients(updatedIngredients);
  };

  const saveFormula = async () => {
    if (!currentFormulaName.trim()) {
      alert("Please enter a formula name.");
      return;
    }

    if (!lotMultiplier.trim()) {
      alert("Please enter a lot number.");
      return;
    }

    if (currentIngredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }

    // Check for valid ingredients
    const invalidIngredients = currentIngredients.some(
      (ingredient) => !ingredient.name || ingredient.ratio <= 0
    );
    if (invalidIngredients) {
      alert("Please provide valid ingredient details.");
      return;
    }

    const totalWeight = calculateTotalWeight();

    const newFormula = {
      name: currentFormulaName,
      lotMultiplier: lotMultiplier, // Add lot number to the formula
      ingredients: currentIngredients,
      totalWeight: totalWeight, // Add total weight to the formula data
    };

    try {
      if (editingId) {
        // Update existing formula
        await axios.put(
          `http://localhost:5001/api/formulas/${editingId}`,
          newFormula
        );
        console.log("Formula updated successfully!");
      } else {
        // Add new formula
        await axios.post("http://localhost:5001/api/formulas", newFormula);
        console.log("Formula saved successfully!");
      }

      // Reset form and refresh formulas
      setCurrentFormulaName("");
      setLotMultiplier(""); // Reset lot number
      setCurrentIngredients([]);
      setEditingIndex(null);
      setEditingId(null);
      fetchFormulas();
    } catch (error) {
      console.error("Error saving formula:", error);
    }
  };

  const deleteFormula = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/formulas/${id}`);
      fetchFormulas();
    } catch (error) {
      console.error("Error deleting formula:", error);
    }
  };

  const editFormula = (index, id) => {
    const formula = formulas[index];
    setCurrentFormulaName(formula.name);
    setLotMultiplier(formula.lotMultiplier); // Set lot number for the formula
    setCurrentIngredients(formula.ingredients);
    setEditingIndex(index);
    setEditingId(id);
  };

  // Calculate total weight of ingredients
  const calculateTotalWeight = () => {
    return currentIngredients
      .reduce(
        (total, ingredient) => total + parseFloat(ingredient.ratio || 0),
        0
      )
      .toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Formula Bin</h2>

      <div className="mb-6">
        <h3 className="text-xl mb-2">
          {editingIndex !== null ? "Edit Formula" : "Create Formula"}
        </h3>

        {/* Formulation Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Formulation Number:
            <input
              type="text"
              value={currentFormulaName}
              onChange={(e) => setCurrentFormulaName(e.target.value)}
              placeholder="Enter formulation number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </label>
        </div>

        {/* Lot Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Lot Multiplier:
            <input
              type="text"
              value={lotMultiplier}
              onChange={(e) => setLotMultiplier(e.target.value)}
              placeholder="Enter lot multiplier"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </label>
        </div>

        {/* Ingredients Table */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Ingredient
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Weight (kg)
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  PHR
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Consumption
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentIngredients.map((ingredient, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    <select
                      value={ingredient.type}
                      onChange={(e) =>
                        handleInputChange(index, "type", e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="rubber">Rubber</option>
                      <option value="chemical">Chemical</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={ingredient.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="">Select Ingredient</option>
                      {(ingredient.type === "rubber"
                        ? rubberIngredients
                        : chemicalIngredients
                      ).map((item) => (
                        <option key={item._id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={ingredient.ratio}
                      onChange={(e) =>
                        handleInputChange(index, "ratio", e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    {ingredient.type === "rubber" ? (
                      <input
                        type="number"
                        value={ingredient.phr}
                        readOnly
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                      />
                    ) : (
                      <input
                        type="number"
                        value={ingredient.phr}
                        onChange={(e) =>
                          handleInputChange(index, "phr", e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    )}
                  </td>

                  <td className="px-4 py-2">{ingredient.consumption}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeRow(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <button
            onClick={addRow}
            className="text-blue-600 hover:text-blue-800"
          >
            Add Row
          </button>
        </div>

        {/* Total Weight */}
        <div className="mb-4 text-lg font-medium">
          <span>Total Weight: </span>
          <span>{calculateTotalWeight()} kg</span>
        </div>

        <div className="flex justify-between">
          <button
            onClick={saveFormula}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm"
          >
            Save Formula
          </button>
        </div>
      </div>

      {/* Saved Formulas */}
      {/* Saved Formulas */}
      <h3 className="text-xl font-semibold text-center mb-4">Saved Formulas</h3>
      <ul className="space-y-4">
        {formulas.map((formula, index) => (
          <li
            key={formula._id}
            className="flex justify-between items-center border-b pb-4"
          >
            <div className="flex-1">
              <p className="text-lg font-medium">{formula.name}</p>
              <p className="text-sm text-gray-500">
                Lot Multiplier: {formula.lotMultiplier}
              </p>
              <p className="text-sm text-gray-500">
                Total Weight: {formula.totalWeight} kg
              </p>

              {/* Display Ingredients in a Table */}
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Ingredient
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Ratio (kg)
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        PHR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formula.ingredients.map((ingredient, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{ingredient.name}</td>
                        <td className="px-4 py-2 capitalize">
                          {ingredient.type}
                        </td>
                        <td className="px-4 py-2">{ingredient.ratio}</td>
                        <td className="px-4 py-2">{ingredient.phr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => editFormula(index, formula._id)}
                className="px-4 py-2 text-sm bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteFormula(formula._id)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded ml-2"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormulaBin;
