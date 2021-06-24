import {afterAll, beforeAll, beforeEach, describe, expect, it, jest} from "@jest/globals";
import puppeteer from "puppeteer";
import config from "../../src/config";
import Dashboard from "../../src/pages/Dashboard";
import ProjectsListPage from "../../src/pages/ProjectsListPage";
import ProjectDetailPage from "../../src/pages/ProjectDetailPage";


/*
 * Note: this test is still a work in progress
*/
describe('Test Scenario 3: Create a BuildConfig with dependencies and execute a build', () => {

  /** @type puppeteer.Browser */
  let browser;

  /** @type puppeteer.Page */
  let page;

  /** test data */
  let testTime;
  let dependencies;
  let buildConfig;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: config.HEADLESS.toLowerCase() === 'true',
      args: [
        '--window-size=1920,1080'
      ]
    });

    page = await browser.newPage();

    initData();

    await page.setViewport({width: 1920, height: 1080});
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  beforeEach(async () => {
    jest.setTimeout(300000);
  });

  function initData() {

    testTime = Date.now();

    dependencies = [{
        name: `z_test_automation-scenario3_config1-${testTime}`,
        environment: 'OpenJDK 11.0; Mvn 3.5.4',
        buildType: 'Maven',
        buildScript: 'mvn deploy -DskipTests=true',
        repositoryUrl: 'git+ssh://code.stage.engineering.redhat.com/git/twitter4j.git',
        revision: '4.0.4'
      },
      {
        name: `z_test_automation-scenario3_config2-${testTime}`,
        environment: 'OpenJDK 11.0; Mvn 3.5.4',
        buildType: 'Maven',
        buildScript: 'mvn deploy -DskipTests=true',
        repositoryUrl: 'https://github.com/project-ncl/dependency-analysis.git',
        revision: '1.2.0'
      },
      {
        name: `z_test_automation-scenario3_config3-${testTime}`,
        environment: 'OpenJDK 11.0; Mvn 3.3.9',
        buildType: 'Maven',
        buildScript: 'mvn deploy -DskipTests=true',
        repositoryUrl: 'git+ssh://code.stage.engineering.redhat.com/thescouser89/jboss-modules-test-1.git',
        revision: '1.5.0.Final'
      }
    ];

    buildConfig = {
      name: `z_test_automation-scenario3_config4-${testTime}`,
      environment: 'OpenJDK 11.0; Mvn 3.5.4',
      buildType: 'Maven',
      buildScript: 'mvn deploy -DskipTests=true',
      repositoryUrl: 'https://github.com/thescouser89/pnc-test-scenario-3',
      dependencies: dependencies.map(d => d.name),
      revision: '1.4.0'
    };
  }


  it('should be able to navigate to the home page', async () => {
    const dashboard = new Dashboard(page);

    await dashboard.goto();

    const title = await page.title();
    expect(title).toEqual('Dashboard | Project Newcastle');
  });

  it('should be able to login successfully', async () => {
    const dashboard = new Dashboard(page);

    await dashboard.login();
    await dashboard.ready();

    const title = await page.title();
    expect(title).toEqual('Dashboard | Project Newcastle');
    // TODO: assert login button now shows as logged in username
  });

  it('should be able to navigate to the projects list page and choose some project', async () => {
    const projectsListPage = new ProjectsListPage(page);

    await projectsListPage.goto();

    const title = await page.title();
    expect(title).toEqual('Projects | Project Newcastle');
  });

  it('should be able to choose some project', async () => {
    const projectsListPage = new ProjectsListPage(page);
    await projectsListPage.selectRandomProject();

    let randomProjectPage = await ProjectDetailPage.fromPage(page);

    expect(await randomProjectPage.getMetaProperty('entity-id')).toBeDefined();
  });

  it('should be able to create BuildConfigs for dependenices', async () => {


    const projectDetailPage = await ProjectDetailPage.fromPage(page);

    for (let bc of dependencies) {
      const wizard = await projectDetailPage.openCreateBCWizard();
      await wizard.createBuildConfig(bc);
      const buildConfigDetailPage = await wizard.gotoNewBuildConfig();
      expect(buildConfigDetailPage.getId()).toBeDefined();
      await projectDetailPage.goto();
    }
  });

  it('should be able to create a Build Config with dependencies', async () => {

    const projectDetailPage = await ProjectDetailPage.fromPage(page);

    const wizard = await projectDetailPage.openCreateBCWizard();
    await wizard.createBuildConfig(buildConfig);
    const buildConfigDetailPage = await wizard.gotoNewBuildConfig();
    expect(buildConfigDetailPage.getId()).toBeDefined();

    // TODO: Veirfy the dependencies are present
    // TODO: Run the build and check that alle dependencies builds were run and successful

  });

});
