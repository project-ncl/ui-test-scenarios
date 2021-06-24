import PncPage from "./PncPage";

export default class BuildConfigDetailPage extends PncPage {

   #id;

    /**
     *     
     * @param {puppeteer.Page} page 
     * @param {string} id - the ID of the Build Config 
     */
    constructor(page, id) {
        super(page);
        this.#id = id;
    }

    async goto() {
        return super.goto(`#/build-configs/${this.#id}`);
    }

    async ready() {
        await this.waitForVisibleElement('pnc-build-config-details-tab pnc-build-config-properties');
    }

    getId() {
        return this.#id;
    }
    // for test
    async getTableRows() {
      return this.page.$$('table tr');
    }
    // for test
    async getRowNames() {
      return this.page.$$eval('table tr td a', e => e.textContent);
    }

    async getBuildButton() {
        return this.waitForVisibleElement('button[ng-click="$ctrl.build()"]');
    }

    async getName() {
        const name = await this.waitForVisibleElement('h1.header-title > pnc-header-title');
        return name.evaluate(node => node.innerText);
    }

    /**
     * 
     * @returns string - buildId
     */
    async startBuild() {
        await(await this.getBuildButton()).click();
        return (await this.getElementText('div.build-panel div.pnc-build-status pnc-build-link > a')).substring(1);
    }

    /**
     * Factory method for creating a BuildConfigDetailPage object from a puppeteer Page that
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
