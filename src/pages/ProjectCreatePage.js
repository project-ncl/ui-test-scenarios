import PncPage from "./PncPage";
import ProjectDetailPage from "./ProjectDetailPage";

export default class ProjectCreatePage extends PncPage {

    async goto() {
        return super.goto('#/projects/create');
    }

    async ready() {
        await this.page.waitForSelector('h1.header-title', { visible: true });
    }

    async typeName(name) {
        await this.page.type('#input-name', name);
    }

    async typeDescription(description) {
        await this.page.type('#input-description', description);
    }

    async typeProjectUrl(projectUrl) {
        await this.page.type('#input-url', projectUrl);
    }

    async typeIssueTrackerUrl(issueTrackerUrl) {
        await this.page.type('#input-issue-tracker', issueTrackerUrl);
    }

    async typeEngineeringTeam(engineeringTeam) {
        await this.page.type('#input-engineering-team', engineeringTeam);
    }

    async typeTechnicalLeader(technicalLeader) {
        await this.page.type('#input-technical-leader', technicalLeader);
    }

    async clickCreate() {
        await this.page.click('input[type=submit]');
    }

    async createProject(spec) {
        await this.ready();

        spec.name && await this.typeName(spec.name);
        spec.description && await this.typeDescription(spec.description);
        spec.projectUrl && await this.typeProjectUrl(spec.projectUrl);
        spec.issueTrackerUrl && await this.typeIssueTrackerUrl(spec.issueTrackerUrl);
        spec.engineeringTeam && await this.typeEngineeringTeam(spec.engineeringTeam);
        spec.technicalLeader && await this.typeTechnicalLeader(spec.technicalLeader);

        await this.clickCreate();
        
        return ProjectDetailPage.fromPage(this.page);
    }

    

}