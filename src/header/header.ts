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
    const logo = document.createElement("img");
    const middleHeaderDiv = document.createElement("div");
    const rightHeaderDiv = document.createElement("div");

    logo.src = "../public/resources/Logo.png";

    div.id = "header-div"
    div.classList.add("headerDiv");
    logo.classList.add("headerLogo");
    middleHeaderDiv.classList.add("middleHeaderDiv");
    rightHeaderDiv.classList.add("rightHeaderDiv");

    div.appendChild(logo);
    div.appendChild(middleHeaderDiv);
    div.appendChild(rightHeaderDiv);


    if (authData.IsLoggedIn()) {
        const dropdownDiv = document.createElement("div");
        const dropdownLabel = document.createElement("label");
        const dropdownSelect = document.createElement("select");
        const dropdownContentDiv = document.createElement("div");
        const profileAnchor = document.createElement("a");
        const logoutAnchor = document.createElement("a");
        const dullOption = document.createElement("option");
        const profileOption = document.createElement("option");
        const logoutOption = document.createElement("option");
        const patientsAnchor = document.createElement("a");
        const consultationsAnchor = document.createElement("a");
        const reportsAnchor = document.createElement("a");

        dropdownLabel.classList.add("dropdownLabel");
        dropdownSelect.classList.add("dropdownSelect");
        dullOption.textContent = "";
        dullOption.classList.add("dullOption");
        profileOption.classList.add("headerAnchor");
        patientsAnchor.classList.add("headerAnchor");
        consultationsAnchor.classList.add("headerAnchor");
        reportsAnchor.classList.add("headerAnchor");
        patientsAnchor.classList.add("patientsAnchor");
        consultationsAnchor.classList.add("consultationsAnchor");
        reportsAnchor.classList.add("reportsAnchor");

        if (profileData.name.length > maximumUserNameLengthForHeader) {
            dullOption.textContent = profileData.name.substring(0, 20) + " ...";
        } else {
            dullOption.textContent = profileData.name;
        }

        dropdownSelect.textContent = "";
        dropdownSelect.onchange = (event: Event) => {
            redirectToPage(dropdownSelect);
        }
        dropdownLabel.appendChild(dropdownSelect);

        profileOption.textContent = "Профиль";
        profileOption.value = "/profile";
        logoutAnchor.textContent = "Выход";
        logoutOption.textContent = "Выход";
        logoutOption.value = "/login";

        patientsAnchor.textContent = "Пациенты";
        consultationsAnchor.textContent = "Консультации";
        reportsAnchor.textContent  = "Отчеты и статистика";
        patientsAnchor.href = "/patients";
        consultationsAnchor.href = "/consultations";
        reportsAnchor.href = "/reports";

        dropdownSelect.appendChild(dullOption);
        dropdownSelect.appendChild(profileOption);
        dropdownSelect.appendChild(logoutOption);
        rightHeaderDiv.appendChild(dropdownLabel);

        middleHeaderDiv.appendChild(patientsAnchor);
        middleHeaderDiv.appendChild(consultationsAnchor);
        middleHeaderDiv.appendChild(reportsAnchor);

        dropdownContentDiv.id = "profileDropdown";
        dropdownContentDiv.appendChild(profileAnchor);
        dropdownContentDiv.appendChild(logoutAnchor);

        div.appendChild(dropdownDiv);
    } else {
        const logInLink = document.createElement("a");
        rightHeaderDiv.appendChild(logInLink);
        logInLink.textContent = "Вход";
        logInLink.href = "/login"
        logInLink.classList.add("headerAnchor");
        div.appendChild(middleHeaderDiv);
        div.appendChild(rightHeaderDiv);
    }
    return div;
}