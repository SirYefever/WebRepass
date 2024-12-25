import coursesHtml from './courses.html?raw'
import createPopupHtml from './popups/newCourse.html?raw'
import {addHtmlToPage, constructPage2, loadCSS} from "../index";
import {getUserRoles} from "../utils/utils.ts";
import {
    CampusCourseModel,
    CreateCampusCourseModel, Semesters, UserModel,
    UserRoles
} from "../api/interfaces.ts";
import {AuthData} from "../LocalDataStorage.ts";

async function coursesPageConstructor(){
    constructPage2(coursesHtml, "/src/courses/courses.css");
    addHtmlToPage(createPopupHtml, "/src/courses/popups/popup.css");
    const curUserRoles = await getUserRoles() as UserRoles;

    if (curUserRoles.isAdmin){
        const createNewButton = document.createElement("button");
        createNewButton?.addEventListener("click", popupCreate);
        createNewButton.textContent = "Add course";
        const createNewDiv = document.querySelector("#create-new-div");
        createNewDiv?.appendChild(createNewButton);
    }
    displayCourses(await fetchCourses());
    $(document).ready(function() {
        $('.summernote').summernote();
    });
    $('.summernote').summernote({
        dialogsInBody: true
    });
}

async function fetchCourses(): Promise<CampusCourseModel[]>{
    const authData = new AuthData();
    const urlSplit = window.location.pathname.split("/");
    const groupId = urlSplit[urlSplit.length - 1];
    const response = await fetch("https://camp-courses.api.kreosoft.space/groups/" + groupId, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + authData.token
        }
    })
    if (response.ok) {
        return (await response.json());
    }
    throw response;
}

function generateAndFillCourseTemplate(courseNumber: number, data: CampusCourseModel): string {
    const result = `
        <div class="course-div">
            <div class="main-part" id="main-part-div-${courseNumber}">
                <p class="course-name" id="course-name-${courseNumber}">${data.name}</p>
                <p id="year-${courseNumber}">Year: ${data.startYear}</p>
                <p id="semester-type-${courseNumber}">Semester: ${data.semester}</p>
                <p id="slots-overall-${courseNumber}">Overall slots: ${data.maximumStudentsCount}</p>
                <p id="slots-left-${courseNumber}">Available slots: ${data.remainingSlotsCount}</p>
            </div>
            
            <div class="course-status" id="course-status-div-${courseNumber}">
                <p id="course-status-p-${courseNumber}">${data.status}</p>
            </div>
        </div>
        `;
    return result;
}

function displayCourses(courses: CampusCourseModel[]) {
    let courseList = document.querySelector("#course-list-ul");
    // @ts-ignore
    courseList.innerHTML = "";
    let courseNumber = 1;
    courses.forEach(course => {
        const listItem = document.createElement("li");
        listItem.innerHTML = generateAndFillCourseTemplate(courseNumber, course);
        courseList?.appendChild(listItem);
    })
}


async function popupCreate(){
    toggleCreatePopup();
    const users = await fetchUsers() as UserModel[];
    const urlSplit = window.location.pathname.split("/");
    const groupId = urlSplit[urlSplit.length - 1];

    var saveButton = document.getElementById("confirm-create-button");
    saveButton?.addEventListener("click", () => createNewCourse(groupId));
    var cancelButton = document.getElementById("cancel-create-button");
    cancelButton?.addEventListener("click", cancelCourseCreation);

    const springCheckbox = document.getElementById("spring");
    springCheckbox?.addEventListener("change", manageCheckingSpring)
    const autumnCheckbox = document.getElementById("autumn");
    autumnCheckbox?.addEventListener("change", manageCheckingAutumn)

    const teacherInput = document.getElementById("teacher-name-input") as HTMLInputElement;
    // @ts-ignore
    teacherInput.onchange = () => {
        console.log(teacherInput.value);
        let subUsers = [] as UserModel[];
        users.forEach((user) => {
            if (user.fullName.includes(<string>teacherInput?.value)) {
                subUsers.push(user);
            }
        })
        fillTeacherSelectWithUsers(subUsers);
    }
    fillTeacherSelectWithUsers(users);
}

function fillTeacherSelectWithUsers(users: UserModel[]) {
    let teacherSelect = document.getElementById("teacher-select");
    // @ts-ignore
    teacherSelect.innerHTML = "";
    users.sort(compareUsersAlphabetically);
    users.forEach(user => {
        const newOption = document.createElement("option");
        newOption.textContent = user.fullName;
        newOption.dataset.info = user.id;
        newOption.classList.add("teacher-option");
        teacherSelect?.appendChild(newOption);
    })
}

function compareUsersAlphabetically(firstUser: UserModel, secondUser: UserModel){
    return firstUser.fullName.localeCompare(secondUser.fullName);
}

function toggleCreatePopup(){
    var popup = document.getElementById("create-popup-span");
    popup?.classList.toggle("show");
}

async function createNewCourse(groupId: string): Promise<void>{
    const courseName = document.getElementById("new-course-name") as HTMLInputElement;
    const startYear = document.getElementById("new-course-start-year") as HTMLInputElement;
    const maxCount = document.getElementById("new-course-maximum-student-count") as HTMLInputElement;
    const semesterValue = getSemesterFromCheckboxes();
    const mainTeacher = document.getElementById("teacher-select") as HTMLSelectElement;
    const reqContent: string = $('#requiremets-div').summernote('code');
    const annoContent: string = $('#annotations-div').summernote('code');
    console.log(mainTeacher?.dataset.info);
    const createModel = {
        name: courseName.value,
        startYear: parseInt(startYear.value),
        maximumStudentsCount: parseInt(maxCount.value),
        semester: semesterValue,
        requirements: reqContent,
        annotations: annoContent,
        mainTeacherId: mainTeacher?.selectedOptions[0].dataset.info
    } as CreateCampusCourseModel

    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/groups/" + groupId, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(createModel)
    })
    if (response.ok) {
        toggleSuccessPopup();
        toggleCreatePopup();
        displayCourses(await fetchCourses());
        courseName.innerHTML = "";
        startYear.innerHTML = "";
        maxCount.innerHTML = "";
        mainTeacher.innerHTML = "";
        const springCheckbox = document.getElementById("spring") as HTMLInputElement;
        springCheckbox.checked = false;
        const autumnCheckbox = document.getElementById("autumn") as HTMLInputElement;
        autumnCheckbox.checked = false;
        $('#requiremets-div').summernote('code', '');
        $('#annotations-div').summernote('code', '');
    }

    else {
        toggleFailurePopup();
    }
    throw response;
}

function getSemesterFromCheckboxes(){
    const springCheckbox = document.getElementById("spring") as HTMLInputElement;
    const autumnCheckbox = document.getElementById("autumn") as HTMLInputElement;
    if (springCheckbox.checked) {
        return "Spring"
    }
    if (autumnCheckbox.checked){
        return "Autumn";
    }
    return null;
}

function cancelCourseCreation(){
    const newNameInput = document.getElementById("confirm-create-button") as HTMLInputElement;
    newNameInput.value = "";
    toggleCreatePopup();
}



function toggleSuccessPopup(){
    const failurePopup = document.getElementById("failure-div")
    if (failurePopup){
        failurePopup.remove();
    }
    const successPopup = document.getElementById("success-div")
    if (successPopup){
        successPopup.remove();
    }

    var popupDiv = document.createElement("div");
    popupDiv.classList.add("popup");
    popupDiv.classList.add("success-div");
    popupDiv.id = "success-div";

    var popupSpan = document.createElement("span");
    popupSpan.classList.add("popuptext");
    popupSpan.classList.add("success-popup-span");
    popupSpan.id = "success-popup-span";

    var popupPar = document.createElement("p");
    popupPar.textContent = "Success";

    popupSpan.appendChild(popupPar);
    popupDiv.appendChild(popupSpan);

    const popupStack = document.getElementById("popup-stack") as HTMLDivElement;
    popupStack?.appendChild(popupDiv);

    popupSpan?.classList.toggle("show");
    setTimeout(() => {
        popupSpan?.classList.add("fade-out");
        setTimeout(() => {
            popupSpan?.classList.toggle("show")
            popupSpan?.classList.remove("fade-out");
            popupDiv.remove();
        }, 500);
    }, 1500);
}

function toggleFailurePopup(){
    const failurePopup = document.getElementById("failure-div")
    if (failurePopup){
        failurePopup.remove();
    }
    const successPopup = document.getElementById("success-div")
    if (successPopup){
        successPopup.remove();
    }

    var popupDiv = document.createElement("div");
    popupDiv.classList.add("popup");
    popupDiv.classList.add("failure-div");
    popupDiv.id = "failure-div";

    var popupSpan = document.createElement("span");
    popupSpan.classList.add("popuptext");
    popupSpan.classList.add("failure-popup-span");
    popupSpan.id = "failure-popup-span";

    var popupPar = document.createElement("p");
    popupPar.textContent = "Fail";

    popupSpan.appendChild(popupPar);
    popupDiv.appendChild(popupSpan);

    const popupStack = document.getElementById("popup-stack") as HTMLDivElement;
    popupStack?.appendChild(popupDiv);

    popupSpan?.classList.toggle("show");
    setTimeout(() => {
        popupSpan?.classList.add("fade-out");
        setTimeout(() => {
            popupSpan?.classList.toggle("show")
            popupSpan?.classList.remove("fade-out");
            popupDiv.remove();
        }, 500);
    }, 1500);
}

function manageCheckingSpring(){
    const autumn = document.getElementById("autumn") as HTMLInputElement;
    const spring = document.getElementById("spring") as HTMLInputElement;
    if (autumn.checked) {
        autumn.checked = false;
    }
    spring.checked = true;
}

function manageCheckingAutumn(){
    const autumn = document.getElementById("autumn") as HTMLInputElement;
    const spring = document.getElementById("spring") as HTMLInputElement;
    if (spring.checked) {
        spring.checked = false;
    }
    autumn.checked = true;
}

async function fetchUsers():Promise<UserModel[] | undefined>{
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/users", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
    })
    if (response.ok) {
        return response.json();
    }
}

export { coursesPageConstructor };