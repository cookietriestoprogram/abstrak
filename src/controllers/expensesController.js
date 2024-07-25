const Expense = require('../models/Expense');
const Collection = require('../models/AbstrakCol');

// Function to get all collections
const getAllCollections = async (req, res) => {
    try {
        const collections = await Collection.find({}).lean();
        res.json(collections);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Function to get all expenses
const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.render('expenses', { expenses });
    } catch (err) {
        res.status(500).send(err);
    }
};

// Function to get an expense by ID
const getExpense = async (req, res) => {
    const expenseId = req.params.id;
    console.log(`Received request to get expense with ID: ${expenseId}`);

    try {
        let expense = await Expense.findById(expenseId).lean();
        
        if (!expense) {
            console.log(`Expense with ID: ${expenseId} not found.`);
            return res.status(404).send('Expense not found');
        }

        console.log(`Expense retrieved: ${JSON.stringify(expense)}`);
        res.send(expense);
    } catch (err) {
        console.error(`Error retrieving expense with ID: ${expenseId}`, err);
        res.status(500).send('Server Error');
    }
};

// Function to add a new expense
const addExpense = async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).send(expense);
    } catch (err) {
        res.status(400).send(err);
    }
};

// Function to update an expense by ID
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!expense) {
            return res.status(404).send();
        }
        res.send(expense);
    } catch (err) {
        res.status(400).send(err);
    }
};

// Function to delete an expense by ID
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).send();
        }
        res.send(expense);
    } catch (err) {
        res.status(500).send(err);
    }
};

const fetchExpenseGraphs = async (req, res) => {
    try {
        const { startDate, endDate } = getLastSixMonthsRange();

        console.log(`Fetching expense data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // Fetch all documents within the date range and print them
        const expensesWithinDateRange = await Expense.find({ date: { $gte: startDate, $lte: endDate } }).lean();
        console.log('Expenses within date range:', expensesWithinDateRange);

        // Perform the aggregation for expenses by category
        const expenseAggregations = await Expense.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $project: {
                category: 1,
                totalCost: { $multiply: ['$amount', '$quantity'] }
            }},
            { $group: {
                _id: '$category',
                totalAmount: { $sum: '$totalCost' }
            }},
            { $project: {
                _id: 0,
                category: '$_id',
                totalAmount: 1
            }},
            { $sort: { totalAmount: -1 } }
        ]);

        console.log('Expenses by Category:', expenseAggregations);

        // Perform the aggregation for expenses by collection and category
        const collectionAggregations = await Expense.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $project: {
                collectionName: 1,
                category: 1,
                totalCost: { $multiply: ['$amount', '$quantity'] }
            }},
            { $group: {
                _id: { collectionName: '$collectionName', category: '$category' },
                totalAmount: { $sum: '$totalCost' }
            }},
            { $project: {
                _id: 0,
                collectionName: '$_id.collectionName',
                category: '$_id.category',
                totalAmount: 1
            }},
            { $sort: { collectionName: 1, totalAmount: -1 } }
        ]);

        console.log('Expenses by Collection and Category:', collectionAggregations);

        res.json({ expenseAggregations, collectionAggregations });
    } catch (error) {
        console.error('Error fetching expense data:', error);
        res.status(500).send('Internal Server Error');
    }
}

function getLastSixMonthsRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0); // Set to start of the day
    endDate.setHours(23, 59, 59, 999); // Set to end of the day
    console.log(`Calculated date range: Start Date = ${startDate.toISOString()}, End Date = ${endDate.toISOString()}`);
    return { startDate, endDate };
}

module.exports = {
    getAllCollections,
    getAllExpenses,
    getExpense,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchExpenseGraphs // Export the new function
};
