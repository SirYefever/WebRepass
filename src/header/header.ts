import { AuthData } from '../LocalDataStorage'
import { ProfileData } from '../LocalDataStorage'

const maximumUserNameLengthForHeader = 24;
const authData = new AuthData();
const profileData = new ProfileData();

function redirectToPage(selectElement: HTMLSelectElement) {
    const selectedValue = selectElement.value;
    if (selectedValue) {
        window.location.href = selectedValue;
    }
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


    if (authData.IsLoggedIn()) {//userprofile anchor && logout anchor
        const profileAnchor = document.createElement("a");
        const logoutAnchor = document.createElement("a");
        const patientsAnchor = document.createElement("a");

        patientsAnchor.classList.add("headerAnchor");
        patientsAnchor.classList.add("patientsAnchor");

        logoutAnchor.textContent = "Выход";

        patientsAnchor.textContent = "Пациенты";
        patientsAnchor.href = "/patients";

        middleHeaderDiv.appendChild(patientsAnchor);
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