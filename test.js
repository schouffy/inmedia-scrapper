const { chromium } = require('playwright');
require('dotenv').config();

(async () => {

    const browser = await chromium.launch();

    const page = await browser.newPage();

    await page.goto('https://bibliotheque.bordeaux.fr/');

    await page.click("#cookie-modal button:first-child");
    await page.getByLabel('CONNEXION').click();

    await page.fill("input#loginField", process.env.USER);
    await page.fill("input#passwordField", process.env.PASS);
    await page.click("form > button");

    await page.waitForSelector('#page-main-content li');

    await page.goto('https://bibliotheque.bordeaux.fr/my/list/tosee');

    await page.waitForSelector("#page-main-content div[role=button]");

    const arrayOfLocators = page.locator('a[href][title][target]');
    const elementsCount = await arrayOfLocators.count();
    const urls = new Array();

    for (var index = 0; index < elementsCount; index++) {
        const element = await arrayOfLocators.nth(index);
        const href = await element.getAttribute("href");
        if (href.includes("/notice")) {
            urls.push('https://bibliotheque.bordeaux.fr' + href);
        }
    }

    for (const url of urls) {
        await page.goto(url);

        await page.waitForSelector('#GeminiScrollBarFormView h2');
        await page.waitForSelector('#location li');
        await page.waitForTimeout(1000);

        const locations = page.locator('#location li');
        const locationCount = await locations.count();

        console.log(await page.locator('#GeminiScrollBarFormView h2').textContent());

        for (var index = 0; index < locationCount; index += 2) {
            const location = await locations.nth(index);
            const availability = await locations.nth(index + 1);
            const locName = await location.textContent();
            if (locName.includes("MIMA")) {
                console.log(`=> ${locName}: ${await availability.textContent()}`);
            }
        }
    }

    await browser.close();

})();