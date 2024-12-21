import defaultPageHtml from './defaultPage.html?raw'
import { constructPage } from "../index";
import { constructPage2 } from "../index";

function defaultPageConstructor() {
    constructPage2(defaultPageHtml, "/src/defaultPage/defaultPage.css");
}

export { defaultPageConstructor }