# PNC UI RELEASE TESTS
Automated release tests for PNC UI
## Requirements
Node Js `>=14.5.5`
NPM `>=6.14.11`
## Environment setup
Create a dotenv file named `.env` in the root folder with the following properties:
```
PNC_UI_URL=<URL of PNC UI to Test>
PNC_USERNAME=<username to log in with>
PNC_PASSWORD=<password to log in with>
HEADLESS=<true|false> 
```
NOTE: Headless should be false for CI environments. Set to true when developing / debugging.

To prepare puppeteer environment run:
```
node node_modules/puppeteer/install.js
``` 

## Running the tests
Run all tests : `npm test`
Run a specific scenario: `npm test -- test-scenario-1`
