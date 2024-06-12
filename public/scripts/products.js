$(document).ready(function() {
    // Pop up 
    $(".three-dots-product-option").click(popupClick);

    $(document).click(closePopup);

    // Add product form
    $('.grid-header-add-button').on('click', function() {
        clearForm();
        $('.add-product-modal').fadeIn();
    });

    $(".main-picture").click(function(event) {
        $("#imageInput").click();
    });

    $('.exit-form').on('click', function() {
        // Clear form
        clearForm();
        $('.add-product-modal').fadeOut();
    });

    $("#imageInput").change(displayUploadedImage);

    $("#imageInput").click(function(event) {
        event.stopPropagation();
    });

    $('#material-input').keydown(listenToTagEntry);

    $('#product-name-input').on('keyup', validateProductName);

    $('#product-price-input').on('keyup', validatePriceInput);

    $('#product-sku-input').on('keyup', validateSKUInput);

    $("#next-form-button").click(toForm2Click);

    $(".add-row-button").click(addVariation);

    $("#back-form-button").click(toForm1Click);

    $(".product-form-stock").on('keyup', validateStockInput);

    $(document).on('input', '.product-form-stock', validateStockInput); // Bind the dynamically added stuff

    $(".product-form-manucost").on('keyup', validatePriceInput);

    $(document).on('input', '.product-form-manucost', validatePriceInput); // Bind the dynamically added stuff

    // Edit product form
    $(".edit-product").click(editProduct);

    // Delete product
    $(".delete-product").click(deleteProduct);

    // Delete row in form
    $('.delete-row-icon').each(deleteRow);

    // Show product card on product picture click
    $(".product-pic").click(function() {
        var container = $(this).closest('.container');
        var productId = container.data('id');
        var productName = container.data('name');
        var productPrice = container.data('price');
        var productSKU = container.data('sku');
        var productMaterials = container.data('materials');
        var productPicture = container.data('picture');
        var totalStock = container.data('totalstock');  // Get total stock from data attribute

        // Set product details in the modal
        $("#dynamic-product-name").text(productName);
        $("#product-name").text(productName);
        $("#product-price").text(productPrice);
        $("#product-sku").text(productSKU);
        $("#product-material").text(productMaterials);
        $(".product-img").attr("src", productPicture);

        // Fetch and display variations
        fetchProductData(productId, totalStock);

        // Show the modal and default to the first section
        $(".product-card-modal").fadeIn();
        showSection(1);
    });

    // Close product card
    function closeCard() {
        $(".product-card-modal").fadeOut();
    }

    // Show specific section of the product card
    function showSection(sectionNumber) {
        $(".product-card-section").removeClass("active");
        $("#section-" + sectionNumber).addClass("active");
    }

    // Next button functionality
    $(".next-section").click(function() {
        showSection(2);
    });

    // Back button functionality
    $(".previous-section").click(function() {
        showSection(1);
    });

    function fetchProductData(productId, totalStock) {
        $.ajax({
            url: `/products/${productId}`,
            method: 'GET',
            success: function(response) {
                var variationsHtml = '';
                response.variations.forEach(function(variation) {
                    variationsHtml += `
                        <div class="variation-row">
                            <div class="bubble"><p>VARIATION: <span class="variation-detail">${variation.variation}</span></p></div>
                            <div class="bubble"><p>STOCK: <span class="stock-detail">${variation.stocks}</span></p></div>
                            <div class="bubble"><p>MANUFACTURING COST: <span class="manucost-detail">${variation.manufacturingCost}</span></p></div>
                            <div class="bubble"><p>SOLD: <span class="sold-detail">${variation.totalQuantitySold}</span></p></div>
                                    
                        </div>
                    `;
                });
                $(".product-variations").html(variationsHtml);
            },
            error: function(xhr, status, error) {
                console.error("Error fetching product data:", error);
            }
        });
    }
});
