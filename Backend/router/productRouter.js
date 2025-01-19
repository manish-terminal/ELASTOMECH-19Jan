import express from "express";
import Product from "../models/productModal.js"; // Adjust path as needed

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("formulations.formulaId"); // Populate formulas if needed
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching products", message: err.message });
  }
});

// POST a new product
router.post("/", async (req, res) => {
  try {
    const {
      articleName,
      image,
      articleNo,
      mouldingTemp,
      formulations,
      mouldNo,
      noOfCavity,
      cycleTime,
      expectedCycles,
      noOfLabours,
      hardness,
      lastUpdated,
    } = req.body;

    const newProduct = new Product({
      articleName,
      image,
      articleNo,
      mouldingTemp,
      formulations,
      mouldNo,
      noOfCavity,
      cycleTime,
      expectedCycles,
      noOfLabours,
      hardness,
      lastUpdated,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Error saving product", message: err.message });
  }
});

// GET transaction logs for a product
router.get("/:id/logs", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ logs: product.transactionLogs || [] });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching transaction logs", message: err.message });
  }
});

// POST a new transaction log for a product
router.post("/:id/log", async (req, res) => {
  try {
    const productId = req.params.id;
    const { particulars, inward, outward, remarks } = req.body;

    if (inward < 0 || outward < 0) {
      return res
        .status(400)
        .json({ error: "Inward and outward quantities must be non-negative" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate new balance
    const lastLog = product.transactionLogs[product.transactionLogs.length - 1];
    const lastBalance = lastLog ? lastLog.balance : 0;
    const newBalance = lastBalance + inward - outward;

    // Create new log entry
    const newLog = {
      date: new Date(),
      particulars,
      inward,
      outward,
      balance: newBalance,
      remarks,
    };

    // Add log to product's transaction logs
    product.transactionLogs.push(newLog);
    await product.save();

    res.status(201).json({ logs: product.transactionLogs });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error logging transaction", message: err.message });
  }
});

export default router;
