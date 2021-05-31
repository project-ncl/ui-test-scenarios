import PncPage from "./PncPage";

export default class BuildDetailPage extends PncPage {

   #id;

    /**
     *     
     * @param {puppeteer.Page} page 
     * @param {string} id - the ID of the Build 
     */
    constructor(page, id) {
        super(page);
        this.#id = id;
    }

    async goto() {
        return super.goto(`#/builds/${this.#id}`);
    }

    async ready() {
        await this.waitForVisibleElement('div.pnc-build-details');
    }

    getId() {
        return this.#id;
    }

    async waitForBuildToComplete(timeoutMS = 1000 * 60 * 5) {
        await this.page.waitForSelector('dt[ng-show="$ctrl.build.endTime"]', { visible: true, hidden: false, timeout: timeoutMS })
    }

    async getBuildStatusText() {
        const buildStatusElem = await this.waitForVisibleElement('dd > span.current-build-status');
        return buildStatusElem.evaluate(node => node.innerText);
    }


    /**
     * Factory method for creating a BuildDetailPage object from a puppeteer Page that
     * has already navigated to the correct url.
     * 
     * @param {puppeteer.Page} page 
     * @returns {BuildConfigDetailPage} 
     */
         static async fromPage(page) {
            const p = new PncPage(page);
            let id;
            try {
                id = await p.getMetaProperty('entity-id');
            } catch (err) {
                throw new Error('Unable to get id of BuildConfig from page metadata');
            }
            return new BuildConfigDetailPage(page, id);
        }


}