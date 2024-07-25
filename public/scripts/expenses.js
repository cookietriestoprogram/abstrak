document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("expense-modal");
    const addBtn = document.getElementById("add-expense-btn");
    const closeBtn = document.getElementsByClassName("close")[0];
    const form = document.getElementById("expense-form");
    
    let categoryChart;
    let collectionData = [];
    let currentCollectionIndex = 0;

    const openModal = () => {
        console.log('Opening modal');
        modal.style.display = "block";
    };

    const closeModal = () => {
        console.log('Closing modal');
        modal.style.display = "none";
        form.reset();
    };

    addBtn.addEventListener('click', async () => {
        document.getElementById("modal-title").innerText = "Add Expense";
        form.reset();
        await fetchCollections();  // Fetch collections when opening the modal
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const expenseId = document.getElementById("expense-id").value;
        const expenseData = {
            name: form.name.value,
            collectionName: form.collection.value,
            date: form.date.value,
            amount: parseFloat(form.amount.value),
            quantity: parseInt(form.quantity.value),
            paymentMethod: form["payment-method"].value,
            category: form.category.value,
            description: form.description.value,
            receiptUrl: form["receipt-url"].value
        };

        // Input validation
        if (expenseData.amount <= 0 || expenseData.quantity <= 0) {
            alert("Amount and Quantity must be greater than zero.");
            return;
        }

        try {
            let response;
            if (expenseId) {
                // Edit expense
                response = await fetch(`/api/expenses/${expenseId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(expenseData)
                });
            } else {
                // Add expense
                response = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(expenseData)
                });
            }

            if (response.ok) {
                const successMessage = expenseId ? 'Expense edited successfully!' : 'Expense added successfully!';
                Swal.fire({
                    title: 'Success',
                    text: successMessage,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                throw new Error('Failed to save the expense');
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });

    // Function to fetch expense details and populate the form
    const fetchExpenseDetails = (expenseId) => {
        console.log(`Fetching details for expense ID: ${expenseId}`);
        $.ajax({
            url: `/api/expenses/${expenseId}`,
            type: 'GET',
            success: function(response) {
                console.log('Expense details fetched successfully:', response);

                // Populate the form with expense details
                populateForm(response);
            },
            error: function(error) {
                console.error('Error fetching expense:', error);
            }
        });
    };

    // Function to fetch collection data and populate the dropdown
    const fetchCollections = () => {
        console.log('Fetching collections...');
        $.ajax({
            url: '/api/collections',
            type: 'GET',
            success: function(response) {
                console.log('Collections data fetched successfully:', response);
                const collectionSelect = document.getElementById("collection");
                collectionSelect.innerHTML = ""; // Clear any existing options
                response.forEach(collection => {
                    const option = document.createElement('option');
                    option.value = collection.name;
                    option.textContent = collection.name;
                    collectionSelect.appendChild(option);
                });
                console.log('Collections dropdown populated successfully');
            },
            error: function(error) {
                console.error('Error fetching collections:', error);
            }
        });
    };

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const expenseId = event.target.dataset.id;
            const expenseName = event.target.dataset.name;
            console.log(`Delete button clicked for expense ID: ${expenseId}`);
            Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to delete the expense "${expenseName}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/api/expenses/${expenseId}`, {
                        method: 'DELETE'
                    }).then(response => {
                        if (response.ok) {
                            Swal.fire(
                                'Deleted!',
                                'Your expense has been deleted.',
                                'success'
                            ).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire(
                                'Error!',
                                'Failed to delete the expense.',
                                'error'
                            );
                        }
                    }).catch(error => {
                        console.error("Error deleting expense:", error);
                        Swal.fire(
                            'Error!',
                            'Failed to delete the expense.',
                            'error'
                        );
                    });
                }
            });
        });
    });
    
    // Function to populate the form with expense details
    const populateForm = async (expense) => {
        console.log('Populating form with data:', expense);
        await fetchCollections(); // Ensure collections are fetched before populating the form
        $('#expense-id').val(expense._id);
        $('#name').val(expense.name).removeClass('correct-input wrong-input');
        $('#collection').val(expense.collectionName).removeClass('correct-input wrong-input');
        $('#date').val(new Date(expense.date).toISOString().split('T')[0]).removeClass('correct-input wrong-input');
        $('#amount').val(expense.amount).removeClass('correct-input wrong-input');
        $('#quantity').val(expense.quantity).removeClass('correct-input wrong-input');
        $('#payment-method').val(expense.paymentMethod).removeClass('correct-input wrong-input');
        $('#category').val(expense.category).removeClass('correct-input wrong-input');
        $('#description').val(expense.description).removeClass('correct-input wrong-input');
        $('#receipt-url').val(expense.receiptUrl).removeClass('correct-input wrong-input');

        // Update modal title
        $('#modal-title').text('Edit Expense');
    };

    // Attach event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const expenseId = event.target.dataset.id;
            console.log(`Edit button clicked for expense ID: ${expenseId}`);
            document.getElementById("modal-title").innerText = "Edit Expense";
            openModal();
            fetchExpenseDetails(expenseId);
        });
    });

    function fetchExpenseGraphs() {
        $.ajax({
            url: '/api/expense-graphs',
            method: 'GET',
            success: function(response) {
                console.log('Expense graphs data fetched:', response);
                var expenseAggregations = response.expenseAggregations;
                var collectionAggregations = response.collectionAggregations;

                var categoryData = calculateCategoryData(expenseAggregations);
                var collectionData = calculateCollectionData(collectionAggregations);

                console.log('Category Data:', categoryData);
                console.log('Collection Data:', collectionData);

                createCategoryPieChart(categoryData);
                createCollectionBarChart(collectionData);
            },
            error: function(xhr, status, error) {
                console.error("Error fetching expense graphs:", error);
            }
        });
    }
    
    function calculateCategoryData(expenseAggregations) {
        const labels = expenseAggregations.map(data => data.category);
        const data = expenseAggregations.map(data => data.totalAmount);

        return { labels, data };
    }
    
    function calculateCollectionData(collectionAggregations) {
        const collections = [...new Set(collectionAggregations.map(data => data.collectionName))];
        const datasets = collections.map(collection => {
            const data = collectionAggregations.filter(item => item.collectionName === collection)
                                                .map(item => item.totalAmount);
            const labels = collectionAggregations.filter(item => item.collectionName === collection)
                                                 .map(item => item.category);
            return { collection, labels, data };
        });

        return datasets;
    }

    
        function createCategoryPieChart(categoryData) {
            var categoryChartCtx = document.getElementById('categoryChart').getContext('2d');

    
            categoryChart = new Chart(categoryChartCtx, {
                type: 'pie',
                data: {
                    labels: categoryData.labels,
                    datasets: [{
                        data: categoryData.data,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 10
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    var label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.raw.toLocaleString();
                                    return label;
                                }
                            }
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                size: 10
                            },
                            formatter: (value, context) => {
                                let sum = 0;
                                let dataArr = context.chart.data.datasets[0].data;
                                dataArr.map(data => {
                                    sum += data;
                                });
                                let percentage = (value * 100 / sum).toFixed(2) + "%";
                                return percentage;
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
    
            console.log('Category chart created:', categoryChart);
        }
    
        function createCollectionBarChart(data) {
            collectionData = data;
            var collectionChartCtx = document.getElementById('collectionChart').getContext('2d');

            collectionChart = new Chart(collectionChartCtx, {
                type: 'bar',
                data: {
                    labels: collectionData[currentCollectionIndex].labels,
                    datasets: [{
                        label: collectionData[currentCollectionIndex].collection,
                        data: collectionData[currentCollectionIndex].data,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 10
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    var label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.raw.toLocaleString();
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        
            console.log('Collection chart created:', collectionChart);
        }
    
        function updateCollectionBarChart(index) {
            const data = collectionData[index];
            window.collectionChart.data.labels = data.labels;
            window.collectionChart.data.datasets[0].label = data.collection;
            window.collectionChart.data.datasets[0].data = data.data;
            window.collectionChart.update();
        }
        
    
        document.getElementById('prevCollection').addEventListener('click', () => {
            currentCollectionIndex = (currentCollectionIndex - 1 + collectionData.length) % collectionData.length;
            updateCollectionBarChart(currentCollectionIndex);
        });
        
        document.getElementById('nextCollection').addEventListener('click', () => {
            currentCollectionIndex = (currentCollectionIndex + 1) % collectionData.length;
            updateCollectionBarChart(currentCollectionIndex);
        });
        
      
     // Fetch expense graphs on page load
    fetchExpenseGraphs();
});
    
