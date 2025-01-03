import {AuthData, LocalDataStorage} from '../LocalDataStorage'
import { ProfileData } from '../LocalDataStorage'
import {k} from "vite/dist/node/types.d-aGj9QkWt";

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
    // <Sidebar>
    const sideBarDarkeningDiv = document.createElement("div");
    sideBarDarkeningDiv.classList.add("side-bar-darkening-div");
    sideBarDarkeningDiv.addEventListener("click", () => {
        // sideBarWholeDiv.classList.add("hidden");
        sideBarWholeDiv.classList.toggle("visible");
    })

    const sideBarDiv = document.createElement("div");
    sideBarDiv.classList.add("side-bar-div");

    const sideBarWholeDiv = document.createElement("div");
    sideBarWholeDiv.classList.add("whole-side-bar-div");
    // sideBarWholeDiv.classList.add("hidden");
    sideBarWholeDiv.classList.add("slide-in");
    sideBarWholeDiv.appendChild(sideBarDiv);
    sideBarWholeDiv.appendChild(sideBarDarkeningDiv);
    document.body.appendChild(sideBarWholeDiv);

    const backArrowImage = document.createElement("img");
    backArrowImage.classList.add("header-image");
    backArrowImage.src = "../../public/resources/backArrow.png";


    const upperDiv = document.createElement("div");
    upperDiv.classList.add("upper-div");

    const sideBarImage = document.createElement("img");
    sideBarImage.src = "../../public/resources/sidebar.png";
    sideBarImage.classList.add("header-image");

    const groupsDiv = document.createElement("div");
    groupsDiv.classList.add("header-groups-div");

    const sideBarButton  = document.createElement("button");
    sideBarButton.classList.add("side-bar-button");
    sideBarButton.appendChild(sideBarImage);

    leftHeaderDiv.appendChild(sideBarButton);

    sideBarButton.addEventListener("click", () => {
        // sideBarWholeDiv.classList.remove("hidden");
        sideBarWholeDiv.classList.toggle("visible");
    })

    sideBarDiv.appendChild(upperDiv);

    // </Sidebar>
    const websiteNameAnchor = document.createElement("a");
    websiteNameAnchor.id = "website-name-anchor";

    const firstNameSpan = document.createElement("span");
    firstNameSpan.textContent = "Кам";
    firstNameSpan.classList.add("yellow-text");

    const secondNameSpan = document.createElement("span");
    secondNameSpan.textContent = "пусные курсы";
    secondNameSpan.classList.add("white-text");


    websiteNameAnchor.appendChild(firstNameSpan);
    websiteNameAnchor.appendChild(secondNameSpan);
    websiteNameAnchor.href = "/"

    leftHeaderDiv.appendChild(websiteNameAnchor);

    div.id = "header-div"
    div.classList.add("header-div");
    leftHeaderDiv.classList.add("left-header-div");
    middleHeaderDiv.classList.add("middleHeaderDiv");
    rightHeaderDiv.classList.add("rightHeaderDiv");
    websiteNameAnchor.classList.add("website-name-par");

    div.appendChild(leftHeaderDiv);
    div.appendChild(middleHeaderDiv);
    div.appendChild(rightHeaderDiv);


    if (authData.IsLoggedIn()) {
        const groupsAnchor = document.createElement("a");
        groupsAnchor.href = "/groups";

        const groupsImage = document.createElement("img");
        groupsImage.src = "../../public/resources/groups.png";
        groupsImage.classList.add("header-image");
        groupsAnchor.appendChild(groupsImage);

        groupsAnchor.classList.add("header-icon");

        const groupsAnchorBlack = document.createElement("a");
        groupsAnchorBlack.href = "/groups";
        groupsAnchorBlack.classList.add("header-icon-black");

        const groupsImageBlack = document.createElement("img");
        groupsImageBlack.src = "../../public/resources/groupsBlack.png";
        groupsImageBlack.classList.add("header-image");

        const groupsPar = document.createElement("p");
        groupsPar.classList.add("groups-par");
        groupsPar.textContent = "Группы курсов"

        groupsAnchorBlack.appendChild(groupsDiv);
        groupsDiv.appendChild(groupsImageBlack);
        groupsDiv.appendChild(groupsPar);

        sideBarDiv.appendChild(groupsAnchorBlack);

        middleHeaderDiv.appendChild(groupsAnchor);

        if (profileData.userRoles.isStudent){
            const myCourses = document.createElement("a");
            myCourses.href = "/courses/my";
            myCourses.classList.add("header-icon");

            const myCoursesImage = document.createElement("img");
            myCoursesImage.src = "../../public/resources/myCourses.png"
            myCoursesImage.classList.add("header-image")

            myCourses.appendChild(myCoursesImage);

            middleHeaderDiv.appendChild(myCourses);

            const myCoursesBlack = document.createElement("a");
            myCoursesBlack.href = "/courses/my";
            myCoursesBlack.classList.add("header-icon-black");

            const myCoursesImageBlack = document.createElement("img");
            myCoursesImageBlack.src = "../../public/resources/myCoursesBlack.png";
            myCoursesImageBlack.classList.add("header-image");

            const myCoursesBlackDiv = document.createElement("div");
            myCoursesBlackDiv.classList.add("header-groups-div");

            const myCoursesBlackPar = document.createElement("p");
            myCoursesBlackPar.textContent = "Мои курсы";
            myCoursesBlackPar.classList.add("groups-par");


            myCoursesBlackDiv.appendChild(myCoursesImageBlack);
            myCoursesBlackDiv.appendChild(myCoursesBlackPar);

            myCoursesBlack.appendChild(myCoursesBlackDiv);

            sideBarDiv.appendChild(myCoursesBlack);
        }

        if (profileData.userRoles.isTeacher){
            const teachingCourses = document.createElement("a");
            teachingCourses.href = "/courses/teaching";
            teachingCourses.classList.add("header-icon");

            const teachingCoursesImage = document.createElement("img");
            teachingCoursesImage.src = "../../public/resources/teachingCourses.png";
            teachingCoursesImage.classList.add("header-image");

            teachingCourses.appendChild(teachingCoursesImage);

            middleHeaderDiv.appendChild(teachingCourses);

            const teachingCoursesBlack = document.createElement("a");
            teachingCoursesBlack.href = "/courses/teaching";
            teachingCoursesBlack.classList.add("header-icon-black");

            const teachingCoursesImageBlack = document.createElement("img");
            teachingCoursesImageBlack.src = "../../public/resources/teachingCoursesBlack.png";
            teachingCoursesImageBlack.classList.add("header-image");

            const teachingCoursesBlackDiv = document.createElement("div");
            teachingCoursesBlackDiv.classList.add("header-groups-div");

            const teachingCoursesBlackPar = document.createElement("p");
            teachingCoursesBlackPar.textContent = "Преподаваемые курсы";
            teachingCoursesBlackPar.classList.add("groups-par");

            teachingCoursesBlackDiv.appendChild(teachingCoursesImageBlack);
            teachingCoursesBlackDiv.appendChild(teachingCoursesBlackPar);

            teachingCoursesBlack.appendChild(teachingCoursesBlackDiv);

            sideBarDiv.appendChild(teachingCoursesBlack);
        }

        const profileAnchor = document.createElement("a");
        profileAnchor.href = "/profile";
        profileAnchor.classList.add("profile-anchor");

        const profileImage = document.createElement("img");
        profileImage.src = "../../public/resources/avatar.png";
        profileImage.classList.add("profile-image");

        const profileParagraph = document.createElement("p");
        profileParagraph.classList.add("profile-paragraph");
        profileParagraph.textContent = shortcutString(profileData.email);

        const profileDiv = document.createElement("div");
        profileDiv.appendChild(profileImage);
        profileDiv.appendChild(profileParagraph);
        profileDiv.classList.add("something");

        profileAnchor.appendChild(profileDiv);

        const logoutAnchor = document.createElement("a");
        logoutAnchor.href = "/login";
        logoutAnchor.classList.add("headerAnchor");
        logoutAnchor.classList.add("logout-anchor");
        logoutAnchor.textContent = "Выход";
        logoutAnchor.onclick = clearLocalStorage;

        const profileAnchorBlack = document.createElement("a");
        profileAnchorBlack.href = "/profile";
        profileAnchorBlack.classList.add("header-icon-black");

        const profileImageBlack = document.createElement("img");
        profileImageBlack.src = "../../public/resources/avatarBlack.png";
        profileImageBlack.classList.add("profile-image");

        const profileParagraphBlack = document.createElement("p");
        profileParagraphBlack.classList.add("groups-par");
        profileParagraphBlack.textContent = shortcutString(profileData.email);

        const profileDivBlack = document.createElement("div");
        profileDivBlack.classList.add("header-groups-div");

        profileDivBlack.appendChild(profileImageBlack);
        profileDivBlack.appendChild(profileParagraphBlack);
        profileAnchorBlack.appendChild(profileDivBlack);


        upperDiv.appendChild(profileAnchorBlack);

        rightHeaderDiv.appendChild(profileAnchor);
        rightHeaderDiv.appendChild(logoutAnchor);

        const logoutAnchorBlack = document.createElement("a");
        logoutAnchorBlack.href = "/login";
        logoutAnchorBlack.classList.add("logout-anchor-black");
        logoutAnchorBlack.textContent = "Выход";
        logoutAnchorBlack.onclick = clearLocalStorage;

        sideBarDiv.appendChild(logoutAnchorBlack);
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

        const regLinkBlack = document.createElement("a");
        const logInLinkBlack = document.createElement("a");

        regLinkBlack.textContent = "Регистрация";
        regLinkBlack.href = "/registration"
        regLinkBlack.classList.add("logout-anchor-black");

        logInLinkBlack.textContent = "Вход";
        logInLinkBlack.href = "/login"
        logInLinkBlack.classList.add("logout-anchor-black");
        div.appendChild(middleHeaderDiv);
        div.appendChild(rightHeaderDiv);

        sideBarDiv.appendChild(logInLinkBlack);
        sideBarDiv.appendChild(regLinkBlack);
    }
    return div;
}

function shortcutString(str: string, maxLength: number = 15){
    if (str.length < maxLength){
        return str;
    }
    return str.substring(0, maxLength);
}