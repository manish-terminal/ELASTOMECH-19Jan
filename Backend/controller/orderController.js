import mongoose from 'mongoose';  // Add this line at the top of your file

import Order from "../models/orderSchema.js";
import Item from '../models/inventoryModal.js'; 

// Fetch all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      itemName,
      weightPerProduct,
      quantity,
      rubberIngredients,
      chemicalIngredients,
      deliveryDate,
      remarks,
    } = req.body;

    // Generate Order ID logic
    const date = new Date();
    const dateString = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const orderNumber = await Order.countDocuments();
    const orderId = `ELAST${dateString}${String(orderNumber + 1).padStart(2, "0")}`;

    const newOrder = new Order({
      orderId,
      customerName,
      itemName,
      weightPerProduct,
      quantity,
      rubberIngredients,
      chemicalIngredients,
      deliveryDate,
      remarks,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// API controller to update order status and quantities
export const updateOrder = async (req, res) => {
  const orderId = req.params.id;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid Order ID' });
  }

  const { manufactured, rejected } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Continue with the update logic...
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


async function updateInventoryBasedOnOrderIngredients(order, totalDecrease) {
  try {
    // Update inventory for rubber ingredients
    for (const ingredient of order.rubberIngredients) {
      const perUnitWeight = ingredient.weight / order.quantity; // Per-unit weight for the rubber ingredient
      const totalWeightToDeduct = perUnitWeight * totalDecrease; // Total weight to deduct
      await adjustInventory(ingredient.name, totalWeightToDeduct);
    }

    // Update inventory for chemical ingredients
    for (const ingredient of order.chemicalIngredients) {
      const perUnitWeight = ingredient.weight / order.quantity; // Per-unit weight for the chemical ingredient
      const totalWeightToDeduct = perUnitWeight * totalDecrease; // Total weight to deduct
      await adjustInventory(ingredient.name, totalWeightToDeduct);
    }
  } catch (error) {
    console.error('Error updating inventory based on order ingredients:', error);
    throw new Error('Failed to update inventory');
  }
}

async function adjustInventory(ingredientName, usage) {
  try {
    // Find the ingredient in inventory
    const item = await Item.findOne({ name: ingredientName });
    if (!item) {
      throw new Error(`Ingredient ${ingredientName} not found in inventory`);
    }

    // Ensure sufficient inventory exists
    if (item.quantity < usage) {
      throw new Error(`Not enough inventory for ${ingredientName}`);
    }

    // Deduct the usage from inventory
    item.quantity -= usage;

    // Save the updated inventory
    await item.save();
  } catch (error) {
    console.error(`Error adjusting inventory for ${ingredientName}:`, error);
    throw new Error(`Error adjusting inventory for ${ingredientName}`);
  }
}
