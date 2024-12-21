import headerBuilder from '../header/header'
import "./../style.css"
import "./../header/header.css"
// import "./../registration/registration.css"
import { LocalDataStorage } from '.././LocalDataStorage'
import { AuthData } from '.././LocalDataStorage'
import { errorPageConstructor } from '../errorPage/errorPage'
import { login } from '../login/login'
import { loginConstructor } from '../login/login'
import { profileConstructor } from '../profile/profile'
import { constructRegPage } from '../registration/registration'
// import { register } from '../registration/registration'
import { Router } from '.././router'
import { defaultPageConstructor } from '../defaultPage/defaultPage'

let authStateProvider = new AuthData();

let router = new Router();

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
// router.template('register', function () {
//   register();
// });


router.route('/login', 'login');
router.route('/registration', 'registration');
router.route('/profile', 'profile');
router.route('/patients', 'patients');
router.route('/error', 'error');
router.route('/patient/', 'patient')

router.template('root', function () {
    defaultPageConstructor();
});
// router.template('root', () => {
//     const route =  authStateProvider.token ? router.resolveRoute('/profile') : router.resolveRoute('/login');
//     if (typeof(route) === 'function') {
//         route();
//     }
// });

router.route('/', 'root');

// router.route('/register', eregister');

function constructPage(innerHTML: string) {
    if (mainContainer !== null) {
        mainContainer.innerHTML = "";
    }
    const headerDiv = document.createElement("div");
    headerDiv.id = "header-div";
    const subMainContainer = document.createElement("div");
    subMainContainer.id = "sub-main-container";

    subMainContainer!.innerHTML = innerHTML;

    mainContainer?.appendChild(headerBuilder());
    mainContainer?.appendChild(subMainContainer);

}

function constructPage2(innerHTML: string, cssFile: string) {
    if (mainContainer !== null) {
        mainContainer.innerHTML = "";
    }
    const headerDiv = document.createElement("div");
    headerDiv.id = "header-div";
    const subMainContainer = document.createElement("div");
    subMainContainer.id = "sub-main-container";

    subMainContainer!.innerHTML = innerHTML;

    mainContainer?.appendChild(headerBuilder());
    mainContainer?.appendChild(subMainContainer);

    loadCSS(cssFile);
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

// let headerContainer = document.getElementById("header-div");

let mainContainer = document.getElementById("mainContainer");
mainContainer?.classList.add("mainContainer");

mainContainer?.prepend(headerBuilder());

let subMainContainer: HTMLDivElement;
// let subMainContainer = document.getElementById("sub-main-container");
// mainContainer?.appendChild(subMainContainer!);

window.addEventListener('load', router.retrieveRoute);
window.addEventListener('hashchange', router.retrieveRoute);

export { refillSubMainContainer, constructPage, constructPage2  }
