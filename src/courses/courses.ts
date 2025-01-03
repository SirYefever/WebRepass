import coursesHtml from './courses.html?raw'
import createPopupHtml from './popups/newCourse.html?raw'
import {addHtmlToPage, constructPage2, loadCSS, makeSubMainContainerVisible} from "../index";
import {getUserRoles} from "../utils/utils.ts";
import {CampusCourseModel, CourseStatuses, CreateCampusCourseModel, UserModel, UserRoles} from "../api/interfaces.ts";
import {AuthData} from "../LocalDataStorage.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";

async function coursesPageConstructor(){
    constructPage2(coursesHtml, "/src/courses/courses.css");
    addHtmlToPage(createPopupHtml, "/src/courses/popups/popup.css");
    loadCSS("/src/defaultPopups/defaultPopups.css");
    initPopupCreate();
    const curUserRoles = await getUserRoles() as UserRoles;

    if (curUserRoles.isAdmin){
        const createNewButton = document.createElement("button");
        createNewButton?.addEventListener("click", popupCreate);
        createNewButton.textContent = "Создать курс";
        createNewButton.classList.add("create-new-course-button");

        const nameDiv = document.querySelector("#group-name-div");
        nameDiv?.appendChild(createNewButton);
    }
    displayCourses(await fetchCourses());
    $(document).ready(function() {
        $('.summernote').summernote();
    });
    $(document).ready(function() {
        $('#requirements-div').summernote();
        $('#annotations-div').summernote();
    });
    $('#requirements-div').summernote({
        dialogsInBody: true
    });
    $('#annotations-div').summernote({
        dialogsInBody: true
    });
    makeSubMainContainerVisible();
}

async function myCoursesPageConstructor(){
    constructPage2(coursesHtml, "/src/courses/courses.css");
    addHtmlToPage(createPopupHtml, "/src/courses/popups/popup.css");

    displayCourses(await myCoursesQuery());
    $(document).ready(function() {
        $('.summernote').summernote();
    });
    $('.summernote').summernote({
        dialogsInBody: true
    });
    makeSubMainContainerVisible();
}

async function teachingCoursesPageConstructor(){
    constructPage2(coursesHtml, "/src/courses/courses.css");
    addHtmlToPage(createPopupHtml, "/src/courses/popups/popup.css");

    const groupNamePar = document.getElementById("group-name-par") as HTMLParagraphElement;
    groupNamePar.textContent = "Teaching Courses";

    displayCourses(await teachingCoursesQuery());
    $(document).ready(function() {
        $('.summernote').summernote();
    });
    $('.summernote').summernote({
        dialogsInBody: true
    });
    makeSubMainContainerVisible();
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

function mapCourseStatusIntoParElement(status: CourseStatuses, courseNumber: number): string{

    const statusTranslationMap = new Map<string, string>();
    statusTranslationMap.set("Created", "Создан");
    statusTranslationMap.set("OpenForAssigning", "Открыт для записи");
    statusTranslationMap.set("Started", "В процессе обучения");
    statusTranslationMap.set("Finished", "Закончен");

    // @ts-ignore
    if (status === CourseStatuses[CourseStatuses.Created]) {
        return `<p class="font" id="course-status-p-${courseNumber}">${statusTranslationMap.get(status)}</p>`;
    }
    else { // @ts-ignore
        if (status === CourseStatuses[CourseStatuses.OpenForAssigning]){
                return `<p class="font green" id="course-status-p-${courseNumber}">${statusTranslationMap.get(status)}</p>`;
            }
            else { // @ts-ignore
            if (status === CourseStatuses[CourseStatuses.Started]){
                            return `<p class="font orange" id="course-status-p-${courseNumber}">${statusTranslationMap.get(status)}</p>`;
                        }
                        else{
                            // @ts-ignore
                return `<p class="font dark-red" id="course-status-p-${courseNumber}">${statusTranslationMap.get(status)}</p>`;
                        }
        }
    }
}

function generateAndFillCourseTemplate(courseNumber: number, data: CampusCourseModel): string {

    const semesterTranslationMap = new Map<string, string>();
    semesterTranslationMap.set("Autumn", "Осенний");
    semesterTranslationMap.set("Spring", "Весенний");

    const result = `
        <div class="course-div">
            <div class="course-name-div">
                <a href="/courses/${data.id}" class="course-name font" id="course-name-${courseNumber}">${data.name}</a>
            </div>
            <div class="main-part" id="main-part-div-${courseNumber}">
                <p class="font" id="year-${courseNumber}">Год обучения: ${data.startYear}</p>
                <p class="font" id="semester-type-${courseNumber}">Семестр: ${semesterTranslationMap.get(data.semester)}</p>
                <p class="font" id="slots-overall-${courseNumber}">Всего мест: ${data.maximumStudentsCount}</p>
                <p class="font" id="slots-left-${courseNumber}">Мест осталось: ${data.remainingSlotsCount}</p>
            </div>
            
            <div class="course-status" id="course-status-div-${courseNumber}">`+
                mapCourseStatusIntoParElement(data.status, courseNumber) +
           `</div>
        </div>
        `;
    return result;
}

function displayCourses(courses: CampusCourseModel[]) {
    let mainCoursesDiv = document.querySelector(".main-courses-div") as HTMLDivElement;
    // @ts-ignore
    mainCoursesDiv.innerHTML = "";
    let courseNumber = 1;
    courses.forEach(course => {
        if (course.status == CourseStatuses.OpenForAssigning){
            return;
        }
        const courseDiv = document.createElement("div");
        courseDiv.innerHTML = generateAndFillCourseTemplate(courseNumber, course);
        // mainCoursesDiv?.appendChild(courseDiv);
        mainCoursesDiv.innerHTML += (generateAndFillCourseTemplate(courseNumber, course));
    })
}


function initPopupCreate(){
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
}

async function popupCreate(){
    toggleCreatePopup();
    const users = await fetchUsers() as UserModel[];

    const teacherInput = document.getElementById("teacher-name-input") as HTMLInputElement;
    // @ts-ignore
    teacherInput.onchange = () => {
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
    const reqContent: string = $('#requirements-div').summernote('code');
    const annoContent: string = $('#annotations-div').summernote('code');
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
        $('#requirements-div').summernote('code', '');
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
    toggleCreatePopup();
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
        },
    })
    if (response.ok) {
        return response.json();
    }
}


async function myCoursesQuery():Promise<CampusCourseModel[]>{
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/my", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + authData.token,
        },
    })
    if (response.ok) {
        return response.json();
    }
    throw response;
}

async function teachingCoursesQuery():Promise<CampusCourseModel[]>{
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/teaching", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + authData.token,
        },
    })
    if (response.ok) {
        return response.json();
    }
    throw response;
}

export { myCoursesPageConstructor, teachingCoursesPageConstructor, coursesPageConstructor };