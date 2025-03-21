import headerBuilder from '../header/header'
import "./../style.css"
import "./../header/header.css"
import { errorPageConstructor } from '../errorPage/errorPage'
import { loginConstructor } from '../login/login'
import { profileConstructor } from '../profile/profile'
import { constructRegPage } from '../registration/registration'
import { Router } from '.././router'
import { defaultPageConstructor } from '../defaultPage/defaultPage'
import {groupsPageConstructor} from "../groups/groups.ts";
import footerHtml from '../footer/footer.html?raw'
import {footerConstructor} from "../footer/footer.ts";
import {coursesPageConstructor, myCoursesPageConstructor, teachingCoursesPageConstructor} from "../courses/courses.ts";
import $ from 'jquery';
import {singleCoursePageConstructor} from "../singleCourse/singleCourse.ts";


let router = new Router();

router.template('root', function () {
    defaultPageConstructor();
});
router.template('login', function () {
    loginConstructor();
});
router.template('registration', function () {
    constructRegPage();
});
router.template('profile', function() {
    profileConstructor();
})
router.template('error', function () {
    errorPageConstructor();
});
router.template('groups', function () {
    groupsPageConstructor();
});
router.template('courses', function () {
    coursesPageConstructor();
});
router.template('singleCourse', function () {
    singleCoursePageConstructor();
})
router.template('my', function () {
    myCoursesPageConstructor();
})
router.template('teaching', function () {
    teachingCoursesPageConstructor();
})
router.route('/login', 'login');
router.route('/registration', 'registration');
router.route('/profile', 'profile');
router.route('/patients', 'patients');
router.route('/error', 'error');
router.route('/groups', 'groups')
router.route('/', 'root');
router.route('/groups/', 'courses');
router.route('/courses/', 'singleCourse');
router.route('/courses/my', 'my');
router.route('/courses/teaching', 'teaching');


function constructPage(innerHTML: string) {
    if (mainContainer !== null) {
        mainContainer.innerHTML = "";
    }
    const headerDiv = document.createElement("div");
    headerDiv.id = "header-div";

    const subMainContainer = document.createElement("div");
    subMainContainer.id = "sub-main-container";
    subMainContainer!.innerHTML = innerHTML;

    const footerDiv = document.createElement("div");
    footerDiv.id = "footer-div";
    footerDiv.innerHTML = footerHtml;

    mainContainer?.appendChild(headerBuilder());
    mainContainer?.appendChild(subMainContainer);
    mainContainer?.appendChild(footerDiv);
    footerConstructor();
}

function constructPage2(innerHTML: string, cssFile: string) {
    if (mainContainer !== null) {
        mainContainer.innerHTML = "";
    }
    const headerDiv = document.createElement("div");
    headerDiv.id = "header-div";
    const subMainContainer = document.createElement("div");
    subMainContainer.id = "sub-main-container";
    subMainContainer.style.visibility = "hidden";
    subMainContainer!.innerHTML = innerHTML;

    const footerDiv = document.createElement("div");
    footerDiv.id = "footer-div";
    footerDiv.innerHTML = footerHtml;

    mainContainer?.appendChild(headerBuilder());
    mainContainer?.appendChild(subMainContainer);
    mainContainer?.appendChild(footerDiv);

    footerConstructor();
    loadCSS(cssFile);
}

function makeSubMainContainerInvisible(){
    const subMainContainer = document.getElementById("sub-main-container") as HTMLDivElement;
    subMainContainer.style.visibility = "hidden";
}

function makeSubMainContainerVisible(){
    const subMainContainer = document.getElementById("sub-main-container") as HTMLDivElement;
    subMainContainer.style.visibility = "visible";
}

function addHtmlToPage(innerHTML: string, cssFile?: string) {
    const subMainContainer = document.querySelector("#sub-main-container");
    subMainContainer!.innerHTML += innerHTML;
    if (cssFile) {
        loadCSS(cssFile);
    }
}

function refillSubMainContainer(innerHTML: string) {
    if (!(subMainContainer === null)) {
        console.log("refill fired");
        subMainContainer!.innerHTML = innerHTML;
    }
}

function loadCSS(href: string) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

let mainContainer = document.getElementById("mainContainer");
mainContainer?.classList.add("mainContainer");

mainContainer?.prepend(headerBuilder());

let subMainContainer: HTMLDivElement;

window.addEventListener('load', router.retrieveRoute);
window.addEventListener('hashchange', router.retrieveRoute);

export { makeSubMainContainerInvisible, makeSubMainContainerVisible, addHtmlToPage, loadCSS, refillSubMainContainer, constructPage, constructPage2  }
