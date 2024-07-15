const { Builder, By, until } = require('selenium-webdriver');

async function testProductDeletion() {
    let driver;

    try {
        driver = await new Builder().forBrowser('chrome').build();

        const collectionId = '6651ead6a17e4939441ea321'; // Change collection upon testing
        await driver.get(`http://localhost:3000/collections/${collectionId}`);

        const productId = '6651f0d4f6accfe89090a8a6';
        await fetchProductData(driver, productId);

        // TEST CASE 1: Cancel of Deletion
        const threeDotsButton = await driver.findElement(By.css('.three-dots-product-option'));
        await driver.wait(until.elementIsVisible(threeDotsButton), 5000);
        await driver.wait(until.elementIsEnabled(threeDotsButton), 5000);
        await driver.sleep(1000);
        await threeDotsButton.click();

        const deleteOption = await driver.findElement(By.css('.product-option-popup.delete-product'));
        await driver.wait(until.elementIsVisible(deleteOption), 5000);
        await driver.wait(until.elementIsEnabled(deleteOption), 5000);
        await driver.sleep(1000);
        await deleteOption.click();

        await driver.wait(until.elementLocated(By.css('.swal2-cancel')), 5000);
        const firstCancelButton = await driver.findElement(By.css('.swal2-cancel'));
        await driver.wait(until.elementIsVisible(firstCancelButton), 5000);
        await driver.wait(until.elementIsEnabled(firstCancelButton), 5000);
        await driver.sleep(1000);
        await firstCancelButton.click();

        await driver.wait(until.stalenessOf(firstCancelButton), 5000);

        // TEST CASE 2: Deletion of Product
        await driver.wait(until.elementIsVisible(threeDotsButton), 5000);
        await driver.wait(until.elementIsEnabled(threeDotsButton), 5000);
        await driver.sleep(1000);
        await threeDotsButton.click();

        await driver.wait(until.elementIsVisible(deleteOption), 5000);
        await driver.wait(until.elementIsEnabled(deleteOption), 5000);
        await driver.sleep(1000);
        await deleteOption.click();

        await driver.wait(until.elementLocated(By.css('.swal2-confirm')), 5000);
        const firstConfirmButton = await driver.findElement(By.css('.swal2-confirm'));
        await driver.wait(until.elementIsVisible(firstConfirmButton), 5000);
        await driver.wait(until.elementIsEnabled(firstConfirmButton), 5000);
        await driver.sleep(1000);
        await firstConfirmButton.click();

        await driver.wait(until.elementLocated(By.css('.swal2-confirm')), 5000);
        const secondConfirmButton = await driver.findElement(By.css('.swal2-confirm'));
        await driver.wait(until.elementIsVisible(secondConfirmButton), 5000);
        await driver.wait(until.elementIsEnabled(secondConfirmButton), 5000);
        await driver.sleep(1000);
        await secondConfirmButton.click();

        await driver.wait(until.elementLocated(By.css('.swal2-success')), 5000);
        const okButton = await driver.findElement(By.css('.swal2-confirm'));
        await driver.wait(until.elementIsVisible(okButton), 5000);
        await driver.wait(until.elementIsEnabled(okButton), 5000);
        await okButton.click();

        await driver.sleep(5000);
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

async function fetchProductData(driver, productId) {
    try {
        await driver.executeScript(`fetchProductData('${productId}')`);
    } catch (error) {
        console.error('Error fetching product data:', error);
    }
}

testProductDeletion();