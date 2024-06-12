const Product = require('../models/Product');
const AbstrakCol = require('../models/AbstrakCol');
const { addProductToCollection } = require('./collectionControllers');

async function fetchProductData(req, res) {
    try {
        const productId = req.params.id;

        // Fetch product data
        const product = await Product.findById(productId).lean();

        // Fetch fulfilled orders
        const fulfilledOrders = await Order.find({ fulfillmentStatus: 'Fulfilled' }).lean();

        // Calculate totalQuantitySold and totalSalesAmount for each variation
        product.variations.forEach(variation => {
            variation.totalQuantitySold = 0;

            fulfilledOrders.forEach(order => {
                order.items.forEach(item => {
                    if (item.productId.toString() === productId && item.variation === variation.variation) {
                        variation.totalQuantitySold += item.quantity;
                    }
                });
            });
        });

        res.json(product);
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
}
    
async function fetchProductData(req, res) {
    try {
        const productId = req.params.id;

        // Fetch product data
        const product = await Product.findById(productId).lean();

        // Fetch fulfilled orders
        const fulfilledOrders = await Order.find({ fulfillmentStatus: 'Fulfilled' }).lean();

        // Initialize metrics
        let totalQuantitySold = 0;
        let totalSalesAmount = 0;
        let totalCost = 0;

        // Calculate metrics for the entire product
        fulfilledOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.productId.toString() === productId) {
                    totalQuantitySold += item.quantity;
                    totalSalesAmount += item.quantity * item.price;
                    totalCost += item.quantity * product.costPrice; // Assuming product.costPrice exists
                }
            });
        });

        // Calculate gross profit and profit margin
        const grossProfit = totalSalesAmount - totalCost;
        const profitMargin = (grossProfit / totalSalesAmount) * 100;

        // Prepare response object
        const response = {
            productId: product._id,
            productName: product.name,
            totalQuantitySold,
            totalSalesAmount,
            costPrice: product.costPrice, // Assuming product.costPrice exists
            sellingPrice: product.price,
            totalCost,
            grossProfit,
            profitMargin,
            returnRate: product.returnRate, // Assuming product.returnRate exists
            overallTrend: {
                salesOverTime: [], // Placeholder for sales over time data
                profitOverTime: [] // Placeholder for profit over time data
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function deleteProductById(req, res) {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const associatedCollections = await AbstrakCol.find({ pieces: productId });

        if (associatedCollections.length > 0) {
            if (req.query.deleteAssociations === 'true') {
                await AbstrakCol.updateMany({ pieces: productId }, { $pull: { pieces: productId } });
                await Product.findByIdAndDelete(productId);
                return res.send('Product and associations deleted');
            } else if (req.query.deleteAssociations === 'false') {
                await Product.findByIdAndDelete(productId);
                return res.send('Product deleted, associations retained');
            } else {
                return res.status(400).send('Invalid deleteAssociations query parameter');
            }
        } else {
            await Product.findByIdAndDelete(productId);
            return res.send('Product deleted');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).send('Server error');
    }
}

async function checkName(req, res) {
    const {name, id }= req.body;

    Product.findOne({ name: name }).lean().then(product => {
        console.log(product);

    if(product && product._id != id) {
        res.send({ success: false, message: 'Product name is not available' })
      } else {
        res.send({ success: true, message: 'Product name is available' })
      }
  
     
    }).catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
    });   

}

async function addProduct(req, res) {
    const { name, price, SKU, material, variations, collectionId } = req.body;

    const newProduct = new Product({
        name,
        picture: req.file.filename ,
        price,
        SKU,
        material: JSON.parse(material),
        variations: JSON.parse(variations)
    });


    try{
        await newProduct.save();
        addProductToCollection(collectionId, newProduct._id);
        res.send({ success: true, message: 'Product added successfully' });
        
    } catch (err) {
        console.log("error in add product: " + err)
    }
    
}

async function fetchSizeStockCost(req, res) {
  const productId = req.params.id;
  console.log(productId);
  try {
      const product = await Product.findById(productId).lean();
      console.log(product);
      
      if (!product) {
          return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);  // Send the product data as a JSON response
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching product data" });
  }
}

async function updateProduct(req, res) {
  const productId = req.params.id;

  const { name, price, SKU, material, variations } = req.body;

  const updates = {
        name,
        price,
        SKU,
        material: JSON.parse(material),
        variations: JSON.parse(variations),
    };

    if(req.file) {
        updates.picture = req.file.filename;
    }

  try {
      // Find the product by ID and update its details
      const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

      if (!updatedProduct) {
          return res.status(404).json({ error: 'Product not found' });
      }

      res.json(updatedProduct); // Return the updated product
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error updating product' });
  }
}

async function checkSKU(req, res) {
    const sku = req.body.sku;

    Product
      .findOne({ SKU: sku })
      .lean()
      .then(product => {
        
        if(product && product._id != req.body.id) {
          res.send({ success: false, message: 'SKU is not available' })
        } else {
          res.send({ success: true, message: 'SKU is available' })
        }
      })
      .catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
      });   



}

module.exports = {
    fetchProductData,
    deleteProductById,
    checkName,
    checkSKU,
    fetchSizeStockCost,
    updateProduct,
    addProduct
};
