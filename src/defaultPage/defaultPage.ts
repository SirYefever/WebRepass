import defaultPageHtml from './defaultPage.html?raw'
import {constructPage2, makeSubMainContainerVisible} from "../index";

function defaultPageConstructor() {
    constructPage2(defaultPageHtml, "/src/defaultPage/defaultPage.css");
    makeSubMainContainerVisible();
}

export { defaultPageConstructor }