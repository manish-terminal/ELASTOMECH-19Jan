import mongoose from "mongoose";

const transactionLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now }, // Date of the transaction
  particulars: { type: String, required: true }, // Description of the transaction
  inward: { type: Number, default: 0 }, // Quantity received
  outward: { type: Number, default: 0 }, // Quantity issued
  balance: { type: Number, default: 0 }, // Current balance after the transaction
  remarks: { type: String }, // Additional remarks about the transaction
});

const productSchema = new mongoose.Schema({
  articleName: { type: String, required: true }, // Name of the product
  image: { type: String }, // Image URL of the product
  articleNo: { type: String, unique: true, required: true }, // Unique identifier for the product
  mouldingTemp: { type: Number }, // Moulding temperature
  formulations: [
    {
      formulaId: { type: mongoose.Schema.Types.ObjectId, ref: "Formula" }, // Reference to the formula
      percentage: { type: Number }, // Percentage of the formula in the product
    },
  ],
  mouldNo: { type: String }, // Mould number associated with the product
  noOfCavity: { type: Number }, // Number of cavities in the mould
  cycleTime: { type: Number }, // Cycle time in seconds
  expectedCycles: { type: Number }, // Expected number of cycles
  noOfLabours: { type: Number }, // Number of labors involved
  hardness: { type: Number }, // Hardness of the product
  lastUpdated: { type: Date, default: Date.now }, // Last updated timestamp
  transactionLogs: [transactionLogSchema], // Logs for transactions (inward/outward movements)
});

const Product = mongoose.model("Product", productSchema);

export default Product;
