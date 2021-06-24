import BuildConfigDetailPage from "./BuildConfigDetailPage";
import PncPage from "./PncPage";

export default class CreateBuildConfigWizard extends PncPage {

    async waitForWizardReady() {
        await this.waitForVisibleElement('pnc-create-build-config-wizard[data-wizard-ready="true"]');
        await this.waitForElementToContainText('h4.modal-title', "Create Build Config");
    }

    async getBuildConfigNameInput() {
        return this.waitForVisibleElement('#build-config-name');
    }

    async getEnvironmentCombobox() {
        return this.waitForVisibleElement('pnc-environment-combobox[name=environment] input.combobox');
    }

    async getFirstEnvironmentOption() {
        return this.waitForVisibleElement('pnc-environment-combobox[name=environment] li.px-combobox-option');
    }

    async getBuildTypeSelect() {
        return this.waitForVisibleElement('#build-config-build-type');
    }

    async getBuildScriptTextArea() {
        return this.waitForVisibleElement('#build-config-build-script');
    }

    async getRepositoryUrlInput() {
        return this.waitForVisibleElement('input[name="repositoryUrl"]');
    }

    async getRevisionInput() {
        return this.waitForVisibleElement('input[name="revision"]');
    }

    async getCreationResult() {
        return Promise.race([
            this.waitForVisibleElement('div.wizard-pf-success-icon'),
            this.waitForVisibleElement('pf-toast-notification div.alert-danger').then(async e => {
                let message = await e.$eval('span span.ng-binding', e => e.textContent);
                throw new Error("Operation did not succeed: " + message);
            })
        ]);
    }

    async typeBuildConfigName(name) {
        await this.simulateType(await this.getBuildConfigNameInput(), name);
    }

    async typeEnvironment(environment) {
        await this.selectComboboxValue('pnc-environment-combobox', environment);
    }

    async selectBuildType(buildType) {
        await (await this.getBuildTypeSelect()).select(buildType);
    }

    async typeBuildScript(buildScript) {
        await (await this.getBuildScriptTextArea()).type(buildScript);
    }

    async typeRepositoryUrl(repositoryUrl) {
        await (await this.getRepositoryUrlInput()).type(repositoryUrl);
    }

    async typeRevision(revision) {
        await (await this.getRevisionInput()).type(revision);
    }

    /**
     * Only reliable way of filling in Patternfly combobox.
     *
     * @param selector
     * @param value
     * @returns {Promise<void>}
     */
    async selectComboboxValue(selector, value) {
        let comboboxInput = await this.waitForVisibleElement(selector + ' input.combobox');
        await comboboxInput.press('Backspace');
        await comboboxInput.evaluate((e, dep) => e.value = dep, value.slice(0, -1));
        await comboboxInput.type(" "); // Trigger list loading
        await this.waitForElementToContainText(selector + ' li.px-combobox-option', value);
        await (await this.waitForVisibleElement(selector + ' li.px-combobox-option')).click();
    }

    async addDependency(dependency) {
        await this.selectComboboxValue('pnc-build-config-combobox', dependency);
        await (await this.waitForVisibleElement('#addButton:not([disabled])')).click();
    }

    async clickNextButton() {
        await this.page.click('#nextButton');
    }

    async gotoRepositoryTab() {
        await this.page.click('li[data-tabgroup="1"] > a');
        await this.getRepositoryUrlInput();
    }

    async gotoSummaryTab() {
        await this.page.click('li[data-tabgroup="2"] > a');
        await this.waitForElementToContainText('#nextButton', 'Create');
    }

    async gotoNewBuildConfig() {
        const viewBCButton = await this.waitForVisibleElement('#view-build-config-button');
        await viewBCButton.click();
        
        await this.waitForVisibleElement('pnc-build-config-properties');

        return BuildConfigDetailPage.fromPage(this.page);
    }



    async createBuildConfig(buildConfigOptions) {
        await this.waitForWizardReady();

        await this.typeBuildConfigName(buildConfigOptions.name);

        await this.typeEnvironment(buildConfigOptions.environment);

        await this.selectBuildType(buildConfigOptions.buildType);

        await this.typeBuildScript(buildConfigOptions.buildScript);

        await this.clickNextButton();
        await this.clickNextButton();
        await this.clickNextButton(); // Dependencies tab

        if (buildConfigOptions.dependencies) {
            for (let dependency of buildConfigOptions.dependencies) {
                await this.addDependency(dependency);
            }
        }

        await this.gotoRepositoryTab();

        await this.typeRepositoryUrl(buildConfigOptions.repositoryUrl);
        await this.waitForElementToContainText('div.alert.alert-info p', "repository is already synced.");

        await this.typeRevision(buildConfigOptions.revision);

        await this.gotoSummaryTab();

        // Next button is now the create button
        await this.clickNextButton();

        await this.getCreationResult();
    }
}
