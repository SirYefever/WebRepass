import defaultPageHtml from './defaultPage.html?raw'
import { constructPage } from "../index";

function defaultPageConstructor() {
    constructPage(defaultPageHtml);
}

export { defaultPageConstructor }