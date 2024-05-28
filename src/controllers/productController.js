


const Product = require('../models/Product');
const AbstrakCol = require('../models/AbstrakCol');

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
    const name = req.body.name;

    Product.findOne({ name: name }).lean().then(product => {
    if(product) {
        res.send({ success: false, message: 'Product name is not available' })
      } else {
        res.send({ success: true, message: 'Product name is available' })
      }
  
     
    }).catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
    });   

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

async function updateProduct (req, res) {
    const productId = req.params.id;
  const productData = req.body;

  try {
      // Find the product by ID and update its details
      const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });

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
        if(product) {
          res.send({ success: false, message: 'SKU is not available' })
        } else {
          res.send({ success: true, message: 'SKU is available' })
        }
      })
      .catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
      });   



}
module.exports = { deleteProductById, checkName, checkSKU, fetchSizeStockCost, updateProduct };
