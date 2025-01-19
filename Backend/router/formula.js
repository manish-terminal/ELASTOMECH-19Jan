import express from 'express';
import Formula from '../models/formulaModal.js';
import axios from 'axios';

const router = express.Router();

// Create a new log for formula usage
router.post('/:id/log', async (req, res) => {
  const { id } = req.params;
  const {
    date,
    shift,
    orderNo,
    machineNo,
    operator,
    batchNo,
    batchWeight,
    numberOfBatches,
    remarks,
  } = req.body;

  try {
    const formula = await Formula.findById(id);
    if (!formula) return res.status(404).json({ message: 'Formula not found' });

    // Calculate the total batch weight for this log entry
    const totalBatchWeight = batchWeight * numberOfBatches;

    // Get the previous balance (if any), or set it to 0 if this is the first log
    const lastLog = formula.logs[formula.logs.length - 1];
    const previousBalance = lastLog ? lastLog.balance : 0;

    // Calculate the new balance by adding the total batch weight to the previous balance
    const newBalance = previousBalance + totalBatchWeight;

    // Create new log entry
    const newLog = {
      date,
      shift,
      orderNo,
      machineNo,
      operator,
      batchNo,
      batchWeight,
      numberOfBatches,
      remarks,
      selectedFormulaId: id,
      balance: newBalance, // Set the new balance here
    };

    // Add log to formula's logs array
    formula.logs.push(newLog);
    await formula.save();

    // Log the transaction for each ingredient
    await logIngredientUsage(formula.ingredients, numberOfBatches, orderNo, remarks);

    res.status(201).json({ message: 'Formula usage logged successfully', newLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging formula usage' });
  }
});

// Helper function to log ingredient usage in the inventory
const logIngredientUsage = async (ingredients, numberOfBatches, orderNo, remarks) => {
  for (const ingredient of ingredients) {
    const totalMaterialUsed = ingredient.ratio * numberOfBatches;

    try {
      // Assuming you're using axios to interact with your inventory API
      const response = await axios.post(`http://localhost:5001/api/items/${ingredient.name}/log`, {
        particulars: `Used in Order ${orderNo}`,
        inward: 0,
        outward: totalMaterialUsed,
        remarks: `Deduction for ${numberOfBatches} batches of formula ${ingredient.name} Remarks:(${remarks})`,
      });

      console.log('Ingredient usage logged:', response.data);
    } catch (error) {
      console.error('Error logging ingredient usage in inventory:', error);
    }
  }
};

// Get formula logs by name
// Get formula logs by name
router.get("/logs/:name", async (req, res) => {
  const { name } = req.params;

  try {
    // Find the formula by its name
    const formula = await Formula.findOne({ name });

    if (!formula) {
      return res.status(404).json({ message: "Formula not found" });
    }

    // Retrieve all logs for the formula
    const logs = formula.logs;

    // Calculate the balance for each log entry
    let runningBalance = 0;

    const updatedLogs = logs.map(log => {
      const totalBatchWeight = log.batchWeight * log.numberOfBatches;
      runningBalance += totalBatchWeight;

      // Add the balance field to each log entry
      return {
        ...log.toObject(),  // Convert mongoose document to plain object
        balance: runningBalance
      };
    });

    // Return the logs with balance
    res.json({ logs: updatedLogs });

  } catch (err) {
    res.status(500).json({ message: "Error retrieving formula logs", error: err });
  }
});


export default router;
