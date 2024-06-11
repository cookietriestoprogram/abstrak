const OrderInfo = require('../models/OrderInfo');
const Product = require('../models/Product');
const multer = require('multer');
const { processCsvData } = require('../routes/loader');
const path = require('path');


const storageCSV = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../models/data/'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadCSV = multer({ storage: storageCSV });

const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const totalOrders = await OrderInfo.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        const orders = await OrderInfo.find().skip(skip).limit(limit).lean();
        const initialOrders = page === 1 ? orders : [];
        const nextPage = page < totalPages ? page + 1 : null;

        // console.log(`Request page: ${page}`);
        // console.log(`Total pages: ${totalPages}`);
        // console.log(initialOrders);  

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // console.log('Sending JSON response');
            res.json({
                orders,
                currentPage: page,
                totalPages
            });
        } else {
            console.log('Rendering orders page');
            res.render('orders', {
                orders: JSON.stringify(orders),
                initialOrders,
                currentPage: page,
                totalPages,
                nextPage,
                "grid-add-button": "Order",
                "grid-title": "ORDERS"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getOrders };


async function getAnOrder(req, res) {
    try {
        const id = req.params.id;
        let order = await OrderInfo.find({ 'orderNo': id }).lean();
        order = order[0];

        // Replace quotes in item names
        for (let item of order.items) {
            item.name = item.name.replaceAll('"', '');
        }

        // Merge items with the same name
        const mergedItems = [];
        for (let item of order.items) {
            const existingItem = mergedItems.find(i => i.name === item.name);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                mergedItems.push({ ...item });
            }
        }

        // Fetch product prices and other details
        for (let item of mergedItems) {
            const product = await Product.findOne({ name: item.name });
            if (product) {
                item.price = product.price;
                item.sku = product.SKU;
                item.picture = product.picture;
            } else {
                item.price = 0; // or any default value you prefer
                item.sku = '';
                item.picture = '';
            }
        }

        order.items = mergedItems;

        console.log(order);
        res.json(order); // Send the order back as a response
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const uploadCSVFile = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const csvFilePath = path.join(__dirname, '../models/data/', req.file.filename);
    processCsvData(csvFilePath)
        .then(() => res.status(200).send('File uploaded and processed successfully.'))
        .catch(error => res.status(500).send('Error processing CSV file: ' + error.message));
};


module.exports = { getOrders, getAnOrder, uploadCSVFile, uploadCSV };
