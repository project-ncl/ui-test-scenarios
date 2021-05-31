import PncPage from "./PncPage";

export default class Dashboard extends PncPage {

    async goto() {
        return super.goto('#/');
    }

}