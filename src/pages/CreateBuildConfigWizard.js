import BuildConfigDetailPage from "./BuildConfigDetailPage";
import PncPage from "./PncPage";

export default class CreateBuildConfigWizard extends PncPage {

    async waitForWizardReady() {
        await this.waitForVisibleElement('pnc-create-build-config-wizard[data-wizard-ready="true"]');
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

    async typeBuildConfigName(name) {
        await (await this.getBuildConfigNameInput()).type(name);
    }

    async typeEnvironment(environment) {
        await (await this.getEnvironmentCombobox()).type(environment);
    }

    async selectFirstEnvironmentOption() {
        await (await this.getFirstEnvironmentOption()).click();
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
        // TODO: remove waitForTimeout calls to improve test speed and reliability 
        await this.waitForWizardReady();

        await this.page.waitForTimeout(2000);

        await this.typeBuildConfigName(buildConfigOptions.name);

        await this.typeEnvironment(buildConfigOptions.environment);

        //TODO find a more reliable way to select environment option
        await this.page.waitForTimeout(2000);
        await this.selectFirstEnvironmentOption();
        await this.page.waitForTimeout(2000);

        await this.selectBuildType(buildConfigOptions.buildType);

        await this.typeBuildScript(buildConfigOptions.buildScript);

        await this.gotoRepositoryTab();

        await this.typeRepositoryUrl(buildConfigOptions.repositoryUrl);
        await this.waitForVisibleElement('div.alert.alert-info');

        await this.typeRevision(buildConfigOptions.revision);

        await this.gotoSummaryTab();

        // Next button is now the create button
        await this.clickNextButton();

        try {
            await this.waitForVisibleElement('.wizard-pf-success-icon');
        } catch (error) {
            throw new Error('Timed out waiting for successful build config creation, this could be because it failed');
        }
    }
}