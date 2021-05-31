import PncPage from "./PncPage";

export default class ProjectsListPage extends PncPage {

    async goto() {
        await super.goto('#/projects');
    }

    async ready() {
        // try {   
        //     this.page.waitForFunction(() => document.querySelector('h1.header-title').textContent.includes(''))
        // } catch (err) {
        //     throw new Error ('Unable to navigate to Projects List Page', err);
        // }
        await this.waitForElementToContainText('h1.header-title', 'Projects');
    }

    async getCreateButton() {
        return this.page.waitForSelector('button[title="Create Project"]');    
    }

}