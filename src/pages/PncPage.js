import puppeteer from "puppeteer"
import config from "../config";
import PrimaryNavBar from "./PrimaryNavBar";

const HEADER_TITLE_SELECTOR = 'h1.header-title';

/**
* Base class 
*/
export default class PncPage {
    /** @type puppeteer.Page */
    page;
    
    primaryNavBar;
    
    /**
    * @param {puppeteer.Page} page 
    */
    constructor(page) {
        this.page = page; 
        this.primaryNavBar = new PrimaryNavBar(page);
    }
    
    /**
    * @param {string} path 
    */
    async goto(path) {
        const url = `${config.PNC_UI_URL}/${path}`;
        await this.page.goto(url);
        await this.ready();
    } 
    
    
    getPrimaryNavBar() {
        return this.primaryNavBar;
    }

    /**
     * Waits until the page has finished loading and is ready. 
     * 
     * NB: this won't work on all pages and this method should be overridden in
     * concrete page classes where this method does not work.
     */
    async ready() {
        await this.page.waitForSelector('ol.breadcrumb', { visible: true });
    }

    /**
     * 
     * @returns Promise<puppeteer.ElementHandle<Element>>
     */
    async getTitleElement() {
        return this.page.waitForSelector(HEADER_TITLE_SELECTOR, { visible: true });
    }

    async getElementText(selector) {
        return (await this.waitForVisibleElement(selector)).evaluate(node => node.innerText);
    }

    async getHeaderTitleText() {
        return this.getElementText(HEADER_TITLE_SELECTOR);
    }

    /**
     * 
     * @param {text} selector 
     * @returns Promise<puppeteer.ElementHandle<Element>>
     */
    async waitForVisibleElement(selector) {
        return this.page.waitForSelector(selector, { visible: true });
    }

    /**
     * 
     * @param {string} selector - queryselector of element to evaluate text content of
     * @param {string} text - value to wait for specified element text to equal
     * @param {number} timeout - time in ms after which to give up waiting and reject promise. 0 = no timeout. default = 30 seconds.
     */
    async waitForElementToContainText(selector, text, timeout = 30000) {
        await this.page.waitForFunction((_selector, _text) => {
            let result;
            try {
                result = document.querySelector(_selector).textContent.includes(_text);
            } catch (error) {
                result = false;
            }
            return result;
        }, { timeout }, selector, text);
    }

    /**
     * 
     * @param {string} property 
     * @returns {Promise<string>}
     */
    async getMetaProperty(property) {
        const selector = `meta[itemprop="${property}"]`;
        await this.page.waitForSelector(selector);
        return this.page.$eval(selector, e => e.content);
    }

    /**
     * Reliable way of typing into input
     * element.type() happens to not finish the typing very often: https://github.com/puppeteer/puppeteer/issues/1648
     */
    async simulateType(elem, value) {
        await elem.evaluate((el, text) => {
            // Refer to https://stackoverflow.com/a/46012210/440432 for the below solution/code
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(el, text);

            const events = ['click', 'focus', 'keydown', 'keypress', 'mousedown', 'compositionend', 'compositionstart', 'blur', 'input']
            events.forEach(event => {
                const ev = new Event(event, {bubbles: true, view: window, cancelable: true});
                el.dispatchEvent(ev);
            });

        }, value);
    }
    
   /**
    * Login simulating a user clicking through the page login link.
    *  
    * @param {string} username The username to login with
    * @param {string} password The password to login with
    */
    async login(username, password) {
        const loginButton = await this.primaryNavBar.getLoginButton();
        
        await Promise.all([
            loginButton.click(),
            this.page.waitForNavigation({
                waitUntil: 'networkidle2',
            }),
        ]);
        
        let title = await this.page.title();
        
        if (title !== 'Log in to pncredhat') {
            throw new Error('Error during login: Keycloak login page did not load.');
        }
        
        await this.page.type('#username', config.PNC_USERNAME);
        await this.page.type('#password', config.PNC_PASSWORD);
        
        await Promise.all([
            this.page.click('#kc-login'),
            this.page.waitForNavigation({
                waitUntil: 'networkidle2',
            }),
        ]);
        
        title = await this.page.title();

        if (title === 'Log in to pncredhat') {
            // We've been redirected to the keycloak login form again 
            // therefore there was a login error e.g. incorrect credentials.
            // const feedbackElem = await this.page.$('div.alert.alert-error span.kc-feedback-text');
            // const feedbackText = await this.page.evaluate(elem => elem.textContent, feedbackElem);

            const feedbackText = await this.getElementText('div.alert.alert-error span.kc-feedback-text');
            throw new Error('Error during login: ' + feedbackText);
        } else {
            await this.ready();
        }
    }
}
