import { jest, describe, it, beforeAll, afterAll, expect, beforeEach } from "@jest/globals";
import puppeteer from "puppeteer";
import config from "../../src/config";
import BuildConfigDetailPage from "../../src/pages/BuildConfigDetailPage";
import BuildDetailPage from "../../src/pages/BuildDetailPage";
import Dashboard from "../../src/pages/Dashboard";
import ProjectCreatePage from "../../src/pages/ProjectCreatePage";
import ProjectDetailPage from "../../src/pages/ProjectDetailPage";
import ProjectsListPage from "../../src/pages/ProjectsListPage";


/*
 * Note: this test is still a work in progress 
*/
describe('Test Scenario 1: Create a simple BuildConfig & execute a build', () => {

     /** @type puppeteer.Browser */
     let browser;

     /** @type puppeteer.Page */
     let page;
   
     beforeAll(async () => {
         browser = await puppeteer.launch({ 
             headless: config.HEADLESS.toLowerCase() === 'true',
             args: [
                 '--window-size=1920,1080'
             ]
         });

         page = await browser.newPage();
         
         await page.setViewport({width: 1920, height: 1080});
     });

     afterAll(async () => {
        await page.close();
        await browser.close();
     });

     beforeEach(async () => {
        jest.setTimeout(30000);
     });


     it('should be able to navigate to the home page', async () => {
        const dashboard = new Dashboard(page);
        
        await dashboard.goto();
        
        const title = await page.title();
        expect(title).toEqual('Dashboard | Project Newcastle');
     });

     it('should be able to login succesfully', async () => {
         const dashboard = new Dashboard(page);
         
         await dashboard.login();
         await dashboard.ready();
         
         const title = await page.title();
         expect(title).toEqual('Dashboard | Project Newcastle');
         // TODO: assert login button now shows as logged in username
     });

     it('should be able to navigate to the projects list page', async () => {
        const projectsListPage = new ProjectsListPage(page);
        
        await projectsListPage.goto();
        
        const title = await page.title();
        expect(title).toEqual('Projects | Project Newcastle');
     });

     it('should be able to create a new Project', async () => {
        // TODO: should ideally test by clicking the "Create Project" button, rather than navigating by URL.
        const newProjectName = `z_automated-test-project-${Date.now()}`;
        const projectCreatePage = new ProjectCreatePage(page);
        await projectCreatePage.goto();
  
        let newProjectPage = await projectCreatePage.createProject({ name: newProjectName });
        
        expect(await newProjectPage.getMetaProperty('entity-id')).toBeDefined();
        expect(await newProjectPage.getHeaderTitleText()).toEqual(newProjectName);
     });

     it('should be able to create a new BuildConfig', async () => {
        const buildConfigProperties = {
            name: `z_test_automation-scenario1-${Date.now()}`,
            environment: 'OpenJDK 11.0; Mvn 3.5.4',
            buildType: 'Maven',
            buildScript: 'mvn deploy -Dmaven.test.skip',
            repositoryUrl: 'git+ssh://code.stage.engineering.redhat.com/jboss-modules/jboss-modules.git',
            revision: '1.5.0.Final'
        };
        
        const projectDetailPage = await ProjectDetailPage.fromPage(page);
        const wizard = await projectDetailPage.openCreateBCWizard();
        await wizard.createBuildConfig(buildConfigProperties);
        const buildConfigDetailPage = await wizard.gotoNewBuildConfig();

        expect(buildConfigDetailPage.getId()).toBeDefined();
        expect(await buildConfigDetailPage.getName()).toEqual(buildConfigProperties.name);
        //TODO verify all buildConfigProperties
     });

     it('should be able to execute a successful build of a simple build config', async () => {
        const bcDetailPage = await BuildConfigDetailPage.fromPage(page);
        
        const buildId = await bcDetailPage.startBuild();
        const buildDetailPage = new BuildDetailPage(page, buildId);
        await buildDetailPage.goto();

        //TODO: Verify live log works

        await buildDetailPage.waitForBuildToComplete(1000 * 60 * 10);
        const finalStatus = await buildDetailPage.getBuildStatusText();

        expect(finalStatus).toEqual('SUCCESS');

        //TODO: Verify correct artifacts are produced.

     }, 1000 * 60 * 12);

});