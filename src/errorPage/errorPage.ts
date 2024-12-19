import errorPageHTML from './errorPage.html?raw'
import { constructPage } from '../index/index'

function errorPageConstructor() {
    constructPage(errorPageHTML);
}

export { errorPageConstructor }