import puppeteer from "puppeteer"

export default class PrimaryNavBar {

    /** @type puppeteer.Page */
    #page;

    /**
     * @param {puppeteer.Page} page 
     */
    constructor(page) {
        this.#page = page;
    }

    async getLoginButton() {
        return this.#page.waitForSelector('#login-button', { visible: true });
    }
}