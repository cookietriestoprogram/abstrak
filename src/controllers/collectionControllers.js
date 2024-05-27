const Collection = require('../models/AbstrakCol');


async function handleCollectionPageRequest (req, res) {
    try {
        const collections = await Collection.find({}).lean();
        res.render("collections", { collections, "grid-add-button": "Collection", "grid-title": "COLLECTIONS" });
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

async function addProductToCollection (collectionId, productId) {
    const collection = await Collection.findById(collectionId);
    collection.pieces.push(productId);
    collection.save();
}

async function handleAddCollectionRequest (req, res) {
    try {
        const { name, description } = req.body
        const collectionPicture = req.file || { filename: 'default.jpg' }

        const newCollection = new Collection({
            name,
            description,
            pieces: [],
            collectionPicture: collectionPicture.filename
        })

        newCollection.save();
        res.send({ success: true, message: 'Collection added successfully' })
    } catch (error) {
        console.log("error in add collections: " + error)
    }
}

async function checkCollectionName (req, res) {
    const name = req.body.name;

    Collection.findOne({ name: name }).lean().then(collection => {
        if(collection) {
            res.send({ success: false, message: 'Collection name is not available' })
        } else {
            res.send({ success: true, message: 'Collection name is available' })
        }
    }
    ).catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
    });
}


async function handleCollectionProductsRequest (req, res) {
    try {
        const collection  = await Collection.findById(req.params.id).populate('pieces').lean();
        const products = collection.pieces;
        
        products.forEach(product => {
            product.totalStock = product.variations.reduce((a, b) => a + b.stocks, 0);
            
        })
        
        res.render("products", { products: collection.pieces, "grid-add-button": "Product", "grid-title": collection.name, "collectionId": collection._id});
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}   
module.exports = {  handleCollectionPageRequest,
                    handleAddCollectionRequest,
                    handleCollectionProductsRequest,
                    checkCollectionName,
                    addProductToCollection
                
                };