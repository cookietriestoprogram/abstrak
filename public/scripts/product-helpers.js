

let tagList, variations = [];
let name, price, sku, materials, editingProductId;
let initialProductDetails = {};
const ROW_VARIATION = '.product-form-variation'
const ROW_STOCK = ".product-form-stock"
const ROW_MANUCOST = ".product-form-manucost"



function popupClick(event){
    event.stopPropagation(); // do not bubble up to the DOM window
    var $popup = $(this).closest('.container').find('.product-options-popup');
    $(".product-options-popup").not($popup).hide(); 
    $popup.toggle(); 
}

function closePopup(event){
    if (!$(event.target).closest('.product-options-popup').length && !$(event.target).hasClass('three-dots-product-option')) {
        $(".product-options-popup").hide();
    }
}

function createImage(source){
    mediaContainer = $(".main-picture")
    const photoContainer = document.createElement('div');
    photoContainer.className = 'product-photo-container';

    const img = document.createElement('img');
    img.src = source;
    img.className = 'product-photo';
    photoContainer.appendChild(img);

    mediaContainer.append(photoContainer);
}

function displayUploadedImage(event) {

    var file = this.files[0];
    var reader = new FileReader();
    
    $(".product-photo-container").remove();
    reader.onload = function(e){
        createImage(e.target.result);
    }
    reader.readAsDataURL(file);
}


function listenToTagEntry(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        var tag = $(this).val().trim();
        if (tag) {
            addTag(tag);
            $(this).val('');
        }
    }
}

function addTag(tag) {
    if (tagList.includes(tag)) {
        console.log('Tag already exists:', tag);
        return;
    }

    tagList.push(tag);

    var tagElement = $('<div>').addClass('material').text(tag);
    var removeButton = $('<span>').addClass('remove-material').text('×').click(function() {
        var index = tagList.indexOf(tag);
        if (index !== -1) {
            tagList.splice(index, 1);
        }
        $(this).parent().remove();
    });
    tagElement.append(removeButton);
    $('#material-list').append(tagElement);
}

function validateProductName() {
    const name = $(this).val();

    if (name === ""){
        $('#product-name-input').removeClass('correct-input').addClass('wrong-input');
    } else {
        $.ajax({
            url: '/api/products/check-name',
            type: 'POST',
            data: {
                name: name
            },
            success: function(data) {
                if(data.success){
                    $('#product-name-input').removeClass('wrong-input').addClass('correct-input');
                } else {
                    $('#product-name-input').addClass('wrong-input');
                }
            }
        });
    }
}

function validateStockInput() {
    const targetCell = $(this);
    const value = Number(targetCell.val()); 

    if (value >= 0) {
        targetCell.removeClass('wrong-input').addClass('correct-input'); 
    } else {
        targetCell.removeClass('correct-input').addClass('wrong-input'); 
    }
}

function validatePriceInput() {
    if(Number($(this).val()) > 0) {
        $(this).removeClass('wrong-input').addClass('correct-input');
    } else {
        $(this).removeClass('correct-input').addClass('wrong-input');
    }
}



function validateSKUInput() {
    if($(this).val() === "") {
        $('#product-sku-input').removeClass('correct-input').addClass('wrong-input');
    } else {
        $.ajax({
            url: '/api/products/check-sku',
            type: 'POST',
            data: {
                sku: $(this).val()
            },
            success: function(data) {
                if(data.success){
                    $('#product-sku-input').removeClass('wrong-input').addClass('correct-input');
                } else {
                    $('#product-sku-input').addClass('wrong-input');
                }
            }
        });
    }
}

function editProduct() {
    event.preventDefault();
    $('.add-product-title').text('Edit Product');

    const $container = $(this).closest('.container');
    editingProductId = $container.data('id');
    const productName = $container.data('name');
    const productPrice = $container.data('price');
    const productSku = $container.data('sku');
    const productMaterials = $container.data('materials').split(',');
    const productPicture = $container.data('picture');

    populateForm(editingProductId, productName, productPrice, productSku, productMaterials, productPicture);
    $('.add-product-modal').fadeIn();
}

function clearForm() {
    toForm1Click();
    $('.add-product-title').text('Add Product');
    editingProductId = null;
    $('#product-name-input').val('').removeClass('correct-input wrong-input');
    $('#product-price-input').val('').removeClass('correct-input wrong-input');
    $('#product-sku-input').val('').removeClass('correct-input wrong-input');
    $('#material-list').empty();
    tagList = [];
    $('.main-picture img').remove();
    $('<img>').attr('src', "/assets/upload-icon.png").attr('alt', "upload").attr('id', 'upload-icon').appendTo('.main-picture');
    const variationContainer = $('.add-product-variation-rows');
    variationContainer.empty(); // Remove all rows


    const emptyRow = `
        <div class="add-product-variation-row">
            <input type="text" placeholder="Variation" class="product-form-variation table-type">
            <input type="number" placeholder="Stock" class="product-form-stock table-type">
            <input type="number" placeholder="Manufacturing Cost" class="product-form-manucost table-type">
        </div>`;
    variationContainer.append(emptyRow);
}

function preloadTag(tag) {
    let tagElement = $('<div>').addClass('material').text(tag);
    let removeButton = $('<span>').addClass('remove-material').text('×').click(function() {
        let index = tagList.indexOf(tag);
        if (index !== -1) {
            tagList.splice(index, 1);
        }
        $(this).parent().remove();
    });
    tagElement.append(removeButton);
    $('#material-list').append(tagElement);
}


function populateForm(id, name, price, sku, materials, picture) {
    $('#product-name-input').val(name).removeClass('correct-input wrong-input');
    $('#product-price-input').val(price).removeClass('correct-input wrong-input');
    $('#product-sku-input').val(sku).removeClass('correct-input wrong-input');
    tagList = materials;
    $('#material-list').empty();
    materials.forEach(material => preloadTag(material));

    $('.main-picture img').remove();
    $('<img>').attr('src', picture).attr('alt', name).appendTo('.main-picture');

    initialProductDetails = {
        name: name,
        price: price,
        sku: sku,
        materials: [...materials],
        picture: picture,
        variations: [] // Initialize with an empty array
    };

    fetchProductData(id);
    createImage(picture);
}

function fetchProductData(productId) {
    $.ajax({
        url: `/products/${productId}`,
        method: 'GET',
        success: function(response) {
            console.log(response.variations);
            $('.add-product-variation-rows').empty();

            // Update initialProductDetails.variations with fetched variations
            initialProductDetails.variations = response.variations.map(variation => ({
                variation: variation.variation,
                stocks: variation.stocks,
                manufacturingCost: variation.manufacturingCost
            }));

            // Populate the form with fetched variations
            response.variations.forEach(variation => {
                let newRow = $('<div>').addClass('add-product-variation-row');
                
                let variationInput = $('<input>')
                    .attr('type', 'text')
                    .attr('placeholder', 'Variation')
                    .addClass('product-variation table-type')
                    .val(variation.variation);
                    
                let stockInput = $('<input>')
                    .attr('type', 'number')
                    .attr('placeholder', 'Stock')
                    .addClass('product-size table-type')
                    .val(variation.stocks);
                    
                let costInput = $('<input>')
                    .attr('type', 'text')
                    .attr('placeholder', 'Manufacturing Cost')
                    .addClass('product-manu-cost table-type')
                    .val(variation.manufacturingCost);
                
                newRow.append(variationInput, stockInput, costInput);
                $('.add-product-variation-rows').append(newRow);
            });
        },
        error: function(xhr, status, error) {
            console.error("Error fetching product data:", error);
        }
    });
}

function deleteProduct(){
        event.preventDefault();
        const $container = $(this).closest('.container');
        const deleteProductId = $container.data('id');
        const productName = $container.data('name');
        const productPicture = $container.data('picture');
    
        Swal.fire({
            title: 'Are you sure?',
            html: `<p>Do you want to delete the product "<strong>${productName}</strong>"?</p><img src="${productPicture}" alt="${productName}" class="swal-product-image">`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Delete associated details?',
                    html: `<p>Do you also want to delete the associated details for "<strong>${productName}</strong>"?</p><img src="${productPicture}" alt="${productName}" class="swal-product-image">`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete associations',
                    cancelButtonText: 'No, keep associations'
                }).then((assocResult) => {
                    if (assocResult.isConfirmed) {
                        $.ajax({
                            url: '/api/products/delete/' + deleteProductId + '?deleteAssociations=true',
                            type: 'DELETE',
                            success: function(result) {
                                Swal.fire(
                                    'Deleted!',
                                    `Product "<strong>${productName}</strong>" and associations have been deleted.`,
                                    'success'
                                ).then(() => location.reload());
                            },
                            error: function(err) {
                                Swal.fire('Error', 'Error deleting product.', 'error');
                            }
                        });
                    } else if (assocResult.dismiss === Swal.DismissReason.cancel) {
                        $.ajax({
                            url: '/api/products/delete/' + deleteProductId + '?deleteAssociations=false',
                            type: 'DELETE',
                            success: function(result) {
                                Swal.fire(
                                    'Deleted!',
                                    `Product "<strong>${productName}</strong>" has been deleted, associations retained.`,
                                    'success'
                                ).then(() => location.reload());
                            },
                            error: function(err) {
                                Swal.fire('Error', 'Error deleting product.', 'error');
                            }
                        });
                    }
                });
            }
        });
}

function nextForm(event){
    event.preventDefault();
    name = $('#product-name-input').val();
    price = $('#product-price-input').val();
    sku = $('#product-sku-input').val();
    materials = tagList;
    picture = $(".product-photo-container")

    if(name === "" || price === "" || sku === "" || materials.length === 0 || picture.length === 0){
        fireErrorSwal("Please fill out all fields and ensure that a picture is uploaded!")
        return;
    }

    $(".form-1").hide();
    $(".form-2").show();
    $("#next-form-button").text("Submit");
    $("#back-form-button").show();
}

function validateForm2(){
    const uniqueVariations = []
    const productVariations = []
    const variations = $('.add-product-variation-row');

    for (let i = 0; i < variations.length; i++) {
        const variation = {};
        variation.variation = $(variations[i]).find(ROW_VARIATION).val();
        variation.stocks = parseInt($(variations[i]).find(ROW_STOCK).val()); 
        variation.manufacturingCost = parseFloat($(variations[i]).find(ROW_MANUCOST).val()); 

        if (!variation.variation || variation.stocks < 0 || variation.manufacturingCost <= 0) {
  
            fireErrorSwal("Please fill out all fields and ensure that stock and manufacturing cost are valid numbers!")
            return;
        }

        if(uniqueVariations.includes(variation.variation)){
            fireErrorSwal("Variations must be unique!")
            return;
        }

        uniqueVariations.push(variation.variation);
        productVariations.push(variation);
    }

    return productVariations

}

function updateForm(name, price, sku, materials, existingProductId) {
    const product = {
        existingProductId: existingProductId,
        name: name,
        price: price,
        SKU: sku,
        material: materials,
        variations: []
    };

    const variations = $('.add-product-variation-row').map(function() {
        return {
            variation: $(this).find('.product-variation').val(),
            stocks: parseInt($(this).find('.product-size').val()), 
            manufacturingCost: parseFloat($(this).find('.product-manu-cost').val())
        };
    }).get();

    let isValid = true;
    for (let variation of variations) {
        if (!variation.variation || isNaN(variation.stocks) || isNaN(variation.manufacturingCost)) {
            isValid = false;
            break;
        }
        product.variations.push(variation);
    }

    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill out all fields and ensure that stock and manufacturing cost are valid numbers!',
        });
        return;
    }

    console.log("Initial product details:", initialProductDetails);
    console.log("Current product details:", product);

    const hasChanges = (
        name !== initialProductDetails.name ||
        price !== initialProductDetails.price ||
        sku !== initialProductDetails.sku ||
        JSON.stringify(materials) !== JSON.stringify(initialProductDetails.materials) ||
        JSON.stringify(product.variations) !== JSON.stringify(initialProductDetails.variations)
    );

    if (!hasChanges) {
        Swal.fire({
            icon: 'info',
            title: 'No changes made',
            text: 'No changes were made to the product.',
        });
    } else {
        $.ajax({
            url: `/api/products/update/${existingProductId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(product),
            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Product updated',
                    text: 'The product has been updated successfully.',
                    showConfirmButton: false // Hide the default "OK" button
                });

                // Close the modal after 3 seconds (for example)
                setTimeout(() => {
                    Swal.close(); 
                    window.location.reload();
                }, 1500);
            },
            error: function(xhr, status, error) {
                Swal.fire('Error', 'There was an error updating the product.', 'error');
            }
        });
    }
}

function submitProduct(event) {
    event.preventDefault();

    const name = $('#product-name-input').val();
    const price = parseFloat($('#product-price-input').val()); // Convert price to float
    const sku = $('#product-sku-input').val();
    const material = $('#material-list').children().map(function() { return $(this).text().replace("×", ""); }).get();
    const existingProductId = editingProductId;
    const image = $("#imageInput")[0].files[0];
    const collectionId = $('.main').data('id');

    if (existingProductId) {
        updateForm(name, price, sku, material, existingProductId);
        return;
    }

    variations = validateForm2();

    if(variations === undefined){
        return;
    }
    
    console.log(variations);
    console.log(material);

    var formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("SKU", sku);
    formData.append("material", JSON.stringify(material));
    formData.append("picture", image);
    formData.append("variations", JSON.stringify(variations));
    formData.append("collectionId", collectionId);


    $.ajax({
        url: '/api/products/add',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(data){
            window.location.reload();
        }
    });
}



function toForm1Click(event){
    $(".form-1").show();
    $(".form-2").hide();
    $("#next-form-button").text("Next");
    $("#back-form-button").hide();
}

function toForm2Click(event){
    
    $("#next-form-button").text() === "Submit" ? submitProduct(event) : nextForm(event);    


}



function addVariation() {
    var newVariationRow = $('.add-product-variation-row:first').clone();
    newVariationRow.find('input').val('');
    newVariationRow.find(ROW_STOCK).removeClass('wrong-input').removeClass('correct-input');
    newVariationRow.find(ROW_MANUCOST).removeClass('wrong-input').removeClass('correct-input');
    $('.add-row-frame').append(newVariationRow);
}


