import CreateBuildConfigWizard from "./CreateBuildConfigWizard";
import PncPage from "./PncPage";
import ProjectsListPage from "./ProjectsListPage";

export default class ProjectDetailPage extends PncPage {

    #id;

    /**
     *     
     * @param {puppeteer.Page} page 
     * @param {string} id - the ID of the project 
     */
    constructor(page, id) {
        super(page);
        this.#id = id;
    }

    async ready() {
        await this.page.waitForSelector('h1.header-title', { visible: true });
    }

    async goto() {
        return super.goto(`#/projects/${this.#id}`);
    }

    async getCreateBuildConfigButton() {
        return this.waitForVisibleElement('button[ng-click="$ctrl.openWizardModal()"]');
    }

    async openCreateBCWizard() {
        const button = await this.getCreateBuildConfigButton();

        await button.click();

        const wizard = new CreateBuildConfigWizard(this.page);

        await wizard.waitForWizardReady();

        return wizard;
    }

    /**
     * Factory method for creating a ProjectDetailPage object from a puppeteer Page that
     * has already navigated to the correct url.
     * 
     * @param {puppeteer.Page} page 
     * @returns {ProjectDetailPage} 
     */
    static async fromPage(page) {
        const p = new PncPage(page);
        let id;
        try {
            id = await p.getMetaProperty('entity-id');
        } catch (err) {
            throw new Error('Unable to get id of project from page metadata');
        }
        return new ProjectDetailPage(page, id);
    }

}
