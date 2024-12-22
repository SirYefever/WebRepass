import { AuthData } from '../LocalDataStorage'
import { ProfileData } from '../LocalDataStorage'

const authData = new AuthData();
const profileData = new ProfileData();

function clearLocalStorage() {
    localStorage.clear();
}

export default function headerBuilder(): HTMLDivElement {

    const div = document.createElement("div");
    const middleHeaderDiv = document.createElement("div");
    const rightHeaderDiv = document.createElement("div");
    const leftHeaderDiv = document.createElement("div");
    const websiteNamePar = document.createElement("p");
    websiteNamePar.textContent = "Кампусные курсы"
    leftHeaderDiv.appendChild(websiteNamePar);

    div.id = "header-div"
    div.classList.add("headerDiv");
    leftHeaderDiv.classList.add("left-header-div");
    middleHeaderDiv.classList.add("middleHeaderDiv");
    rightHeaderDiv.classList.add("rightHeaderDiv");
    websiteNamePar.classList.add("website-name-par");

    // div.appendChild(logo);
    div.appendChild(leftHeaderDiv);
    div.appendChild(middleHeaderDiv);
    div.appendChild(rightHeaderDiv);


    if (authData.IsLoggedIn()) {
        const groupsAnchor = document.createElement("a");
        groupsAnchor.href = "/groups";
        groupsAnchor.textContent = "Groups";
        groupsAnchor.classList.add("headerAnchor");

        leftHeaderDiv.appendChild(groupsAnchor);

        const profileAnchor = document.createElement("a");
        profileAnchor.href = "/profile";
        profileAnchor.classList.add("headerAnchor");

        const logoutAnchor = document.createElement("a");
        logoutAnchor.href = "/login";
        logoutAnchor.classList.add("headerAnchor");
        logoutAnchor.textContent = "Выход";
        profileAnchor.textContent = profileData.email;
        logoutAnchor.onclick = clearLocalStorage;

        rightHeaderDiv.appendChild(profileAnchor);
        rightHeaderDiv.appendChild(logoutAnchor);
    } else {
        const regLink = document.createElement("a");
        const logInLink = document.createElement("a");

        rightHeaderDiv.appendChild(regLink);
        rightHeaderDiv.appendChild(logInLink);

        regLink.textContent = "Регистрация";
        regLink.href = "/registration"
        regLink.classList.add("headerAnchor");

        logInLink.textContent = "Вход";
        logInLink.href = "/login"
        logInLink.classList.add("headerAnchor");
        div.appendChild(middleHeaderDiv);
        div.appendChild(rightHeaderDiv);
    }
    return div;
}