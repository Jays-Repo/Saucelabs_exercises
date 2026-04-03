const { Builder, By, Key, until } = require('selenium-webdriver')
const utils = require('./utils')
const chrome = require('selenium-webdriver/chrome');

const SAUCE_USERNAME = process.env.SAUCE_USERNAME;
const SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY;
const ONDEMAND_URL = `https://${SAUCE_USERNAME}:${SAUCE_ACCESS_KEY}@ondemand.us-west-1.saucelabs.com:443/wd/hub`;
// NOTE: Use the URL below if using our EU datacenter (e.g. logged in to app.eu-central-1.saucelabs.com)
// const ONDEMAND_URL = `https://${SAUCE_USERNAME}:${SAUCE_ACCESS_KEY}@ondemand.eu-central-1.saucelabs.com:443/wd/hub`;


/**
* Run this test before working on the problem.
* When you view the results on your dashboard, you'll see that the test "Failed".
* Your job is to:
* 1) Figure out why the test failed and make the changes necessary to make the test pass.
* 2) Once you get the test working, update the code so that when the test runs, it can reach the Sauce Labs homepage,
* 3) hover over 'Developers' and then clicks the 'Documentation' link
*/

describe('Broken Sauce', function () {
    it('should go to Google and click Sauce', async function () {

        try {
            const chromeOptions = new chrome.Options();
            chromeOptions.addArguments('--disable-blink-features=AutomationControlled');
            chromeOptions.excludeSwitches(['enable-automation']);

            let driver = await new Builder().withCapabilities(utils.brokenCapabilities).setChromeOptions(chromeOptions).usingServer(ONDEMAND_URL).build();

            await driver.get("https://www.google.com");
            // If you see a German or English GDPR modal on google.com you 
            // will have to code around that or use the us-west-1 datacenter.
            // You can investigate the modal elements using a Live Test(https://app.saucelabs.com/live/web-testing)

            //Here I changed to search by title
            let search = await driver.findElement(By.css('[title="Search"]'));
            await search.sendKeys("Sauce Labs");

            let button = await driver.findElement(By.name("btnK"))
            await button.click()

            //here I changed what we were searching for, 'sauce' was not the correct text string
            let page = await driver.findElement(By.partialLinkText("Sauce Labs: Cross Browser Testing, Selenium Testing ..."));
            await page.click();

            //Hover action goes here
            //I cannot use this css locator, due to the fact that this occurs 4 times throughout the webpage
            // let developersTab = await driver.findElement(By.css(".navMenuLabel.MuiBox-root.css-0"));
            //xpath option, more clear, will take longer but will for sure find correct element to hover
            let developersTab = await driver.findElement(
                By.xpath("//*[contains(@class, 'navDropdown-text') and .//div[text()='Developers']]")
            );
            const actions = driver.actions({ async: true });
            await actions.move({ origin: developersTab }).perform();

            //Navigate to documents after hovering
            let devDocumentation = await driver.findElement(
                By.css("a[href='https://docs.saucelabs.com/']"));
            await devDocumentation.click();

            //the page opens on a new tab, which is why we get a white page at the end of this test, I think?

            await driver.quit();
        } catch (err) {
            // hack to make this pass for Gitlab CI
            // candidates can ignore this
            if (process.env.GITLAB_CI === 'true') {
                console.warn("Gitlab run detected.");
                console.warn("Skipping error in brokenSauce.js");
            } else {
                throw err;
            }
        }

    });
});
