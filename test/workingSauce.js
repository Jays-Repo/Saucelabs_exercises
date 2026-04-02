const { Builder, By, Key, until } = require('selenium-webdriver')
const SauceLabs = require('saucelabs').default;
const assert = require('assert');
const utils = require('./utils');
const { text } = require('stream/consumers');

const SAUCE_USERNAME = process.env.SAUCE_USERNAME;
const SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY;
console.log(SAUCE_USERNAME);
console.log(SAUCE_ACCESS_KEY);
console.log("test test 123");
const client = new SauceLabs({
    user: SAUCE_USERNAME,
    key: SAUCE_ACCESS_KEY
});


// NOTE: Use the URL below if using our US datacenter (e.g. logged in to app.saucelabs.com)

const ONDEMAND_URL = `https://${SAUCE_USERNAME}:${SAUCE_ACCESS_KEY}@ondemand.saucelabs.com:443/wd/hub`;
// NOTE: Use the URL below if using our EU datacenter (e.g. logged in to app.eu-central-1.saucelabs.com)
// const ONDEMAND_URL = `https://${SAUCE_USERNAME}:${SAUCE_ACCESS_KEY}@ondemand.eu-central-1.saucelabs.com:443/wd/hub`;

/**
* Task I: Update the test code so when it runs, the test clicks the "I am a link" link.
*
* Task II - Comment out the code from Task I. Update the test code so when it runs, 
* the test is able to write "Sauce" in the text box that currently says "I has no focus".
*
* Task III - Update the test code so when it runs, it adds an email to the email field, 
* adds text to the comments field, and clicks the "Send" button.
* Note that email will not actually be sent!
*
* Task IV - Add a capability that adds a tag to each test that is run.
* See this page for instructions: https://docs.saucelabs.com/dev/test-configuration-options/
* 
* Task V: Set the status of the test so it shows as "passed" instead of "complete".
* We've included the node-saucelabs package already. For more info see:
* https://github.com/saucelabs/node-saucelabs
*/

//I am creating each test independent of one another so that we can see that
//the tests were failed/passed
describe('Working Sauce', function () {
    it('should go to Google and click Sauce', async function () {
        let driver = await new Builder().withCapabilities(utils.workingCapabilities)
            .usingServer(ONDEMAND_URL).build();


        /**
         * Goes to Sauce Lab's guinea-pig page and verifies the title
         */
        await driver.get("https://saucelabs.com/test/guinea-pig");
        await assert.strictEqual("I am a page title - Sauce Labs", await driver.getTitle());
        await driver.quit();
    });

    //Task I
    // it('should click link on guinea-pig page', async function () {
    //     const capabilitiesWithTags = {
    //         ...utils.workingCapabilities,
    //         'sauce:options': {
    //             ...utils.workingCapabilities['sauce:options'],
    //             tags: ["Task I"]
    //         }
    //     };
    //     let driver = await new Builder().withCapabilities(capabilitiesWithTags)
    //         .usingServer(ONDEMAND_URL).build();

    //     let testPassed = false;
    //     //Going to wrap all of these in a try catch - want to log errors as they occurr
    //     try {
    //         await driver.get("https://saucelabs.com/test/guinea-pig");
    //         await assert.strictEqual("I am a page title - Sauce Labs", await driver.getTitle());
    //         const element = await driver.wait(
    //             until.elementLocated(By.id("i am a link")), 5000
    //         );
    //         await driver.wait(until.elementIsVisible(element), 5000);
    //         await element.click();
    //         //validation that we are on the correct page - is there a way we can validate using http status codes aws well?
    //         await assert.strictEqual("I am another page title - Sauce Labs", await driver.getTitle());

    //         testPassed = true;
    //     } catch (clickErr) {
    //         console.log("Error clicking the link or validating page:", clickErr);
    //         throw clickErr;
    //     } finally {
    //         const sessionId = await driver.getSession().then(s => s.getId());
    //         await client.updateJob(SAUCE_USERNAME, sessionId, { passed: testPassed });
    //         await driver.quit();
    //     }
    // });

    // Task II
    it('should update the textbox', async function () {
        const capabilitiesWithTags = {
            ...utils.workingCapabilities,
            'sauce:options': {
                ...utils.workingCapabilities['sauce:options'],
                tags: ["Task II"]
            }
        };
        let driver = await new Builder().withCapabilities(capabilitiesWithTags)
            .usingServer(ONDEMAND_URL).build();

        let testPassed = false;
        try {
            await driver.get("https://saucelabs.com/test/guinea-pig");
            const textbox = await driver.wait(until.elementLocated(By.id('i_am_a_textbox')), 5000);
            await driver.wait(until.elementIsVisible(textbox), 5000);

            //validate that the checkbox currently contains 'i has no focus' - thats the box we need to change
            const oldValue = await textbox.getAttribute("value");
            await assert.strictEqual(oldValue, "i has no focus", "Text before clearing");

            //validate clearing the correct textbox
            await textbox.clear();
            const value = await textbox.getAttribute("value");
            assert.strictEqual(value, "", "Textbox should be empty after clearing");

            //validate the new value
            await textbox.sendKeys("Sauce");
            const newValue = await textbox.getAttribute("value");
            assert.strictEqual(newValue, "Sauce", "New text value should say Sauce");

            //all assertions pass, we can set flag to true
            testPassed = true;
        } catch (textBoxErr) {
            console.log("Error in textbox clearing and replacing process");
            throw textBoxErr;
        } finally {
            const sessionId = await driver.getSession().then(s => s.getId());
            //for task IV, adding pass/fail to saucelabs dashboard
            await client.updateJob(SAUCE_USERNAME, sessionId, { passed: testPassed });
            await driver.quit();
        }
    });

    // Task III
    it('should add email, comments, and click send', async function () {
        const capabilitiesWithTags = {
            ...utils.workingCapabilities,
            'sauce:options': {
                ...utils.workingCapabilities['sauce:options'],
                tags: ["Task III"]
            }
        };
        let driver = await new Builder().withCapabilities(capabilitiesWithTags)
            .usingServer(ONDEMAND_URL).build();

        let testPassed = false;
        //add email
        try {
            await driver.get("https://saucelabs.com/test/guinea-pig");
            //email portion
            const emailElement = await driver.wait(until.elementLocated(By.id('fbemail')), 5000);
            const placeholderText = await emailElement.getAttribute('placeholder')
            assert.strictEqual(placeholderText, "We would really like to follow up!", "Placeholder text should match")
            await emailElement.sendKeys("exampleEmail@exampledomain.edu");
            const newEmail = await emailElement.getAttribute('value');
            assert.strictEqual(newEmail, "exampleEmail@exampledomain.edu", "New email placed correctly");

            //comment box portion
            const commentBoxElement = await driver.wait(until.elementLocated(By.id('comments')), 5000);
            const commentPlaceholderText = await commentBoxElement.getAttribute('placeholder');
            assert.strictEqual(commentPlaceholderText, 'Thanks in advance, this is really helpful.', "Placeholder text for comment box");
            await commentBoxElement.sendKeys("Some random comment goes here");
            const newComment = await commentBoxElement.getAttribute('value');
            assert.strictEqual(newComment, "Some random comment goes here", "New comment correctly placed");

            //click send
            const sendButton = await driver.wait(until.elementLocated(By.id('submit')), 5000);
            const sendButtonValue = await sendButton.getAttribute('value');
            assert.strictEqual(sendButtonValue, 'send', "Send button text should say send");
            await sendButton.click();

            testPassed = true;
        } catch (err) {
            console.log("Error in send button clicking validation", err);
            throw err;
        }
        finally {
            const sessionId = await driver.getSession().then(s => s.getId());
            await client.updateJob(SAUCE_USERNAME, sessionId, { passed: testPassed });
            await driver.quit();
        }
    });
});