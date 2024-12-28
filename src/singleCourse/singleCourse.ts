import courseHtml from './singleCourse.html?raw'
import redactPopup from './popups/redactStatusPopup.html?raw'
import {addHtmlToPage, constructPage2, makeSubMainContainerVisible} from "../index";
import {AuthData} from "../LocalDataStorage.ts";
import {
    CourseInfoModel, CourseStatuses, EditCourseStatusModel,
    StudentDataModel, StudentStatuses, UserRoles
} from "../api/interfaces.ts";
import { marked } from 'marked';
import {getUserRoles} from "../utils/utils.ts";

async function singleCoursePageConstructor(){
    constructPage2(courseHtml, "/src/singleCourse/singleCourse.css");
    addHtmlToPage(redactPopup, "/src/singleCourse/popups/popup.css");
    const courseData = await getCourseInfo() as CourseInfoModel;
    const curUserRoles = await getUserRoles() as UserRoles;

    const courseNamePar = document.getElementById("course-name");
    // @ts-ignore
    courseNamePar.textContent = courseData.name;

    const statusDiv = document.querySelector(".status-par-and-button-div") as HTMLDivElement;
    if (curUserRoles.isAdmin || curUserRoles.isTeacher){// Wrong??? One has to be a teacher for this specific course,
                                                        // not just for any course out there.
        const redactStatusButton = document.createElement("button");
        redactStatusButton.textContent = "Change status";
        redactStatusButton.addEventListener("click", () => {
            popupRedactStatus();
        })
        statusDiv.appendChild(redactStatusButton);
    }



    const statusPar = document.getElementById("status-par");
    statusPar.textContent += courseData.status;
    const yearPar = document.getElementById("year-par");
    yearPar.textContent += courseData.startYear.toString();
    const totalCountPar = document.getElementById("total-count-par");
    totalCountPar.textContent += courseData.maximumStudentsCount.toString();
    const pendingPar = document.getElementById("students-pending-par");
    const semesterPar = document.getElementById("semester-par");
    semesterPar.textContent += courseData.semester;
    const enrolledPar = document.getElementById("students-enrolled-par");

    const requirementsPar = document.getElementById("requirements-content");
    requirementsPar.innerHTML = await marked(courseData.requirements);
    const annoPar = document.getElementById("anno-content");
    annoPar.innerHTML = await marked(courseData.requirements);

    const teachersList = document.getElementById("teachers-list") as HTMLUListElement;
    courseData.teachers.forEach(teacher => {
        let listItem = document.createElement("li");
        listItem.setAttribute("id", "teacher-list-item");

        const fullNamePar = document.createElement("p");
        fullNamePar.textContent = teacher.name;
        listItem.appendChild(fullNamePar);

        const emailPar = document.createElement("p");
        emailPar.textContent = teacher.email;
        listItem.appendChild(emailPar);

        if (teacher.isMain) {
            const isMain = document.createElement("div");
            isMain.classList.add("is-main-div");
            isMain.textContent = "is main";
            listItem.appendChild(isMain);
        }

        teachersList.append(listItem);
    })

    const studentsList = document.getElementById("students-list") as HTMLUListElement;
    let studentsEnrolled = 0;
    let studentsInQueue = 0;
    courseData.students.forEach(student => {
        if (student.status === StudentStatuses.Accepted) {
            studentsEnrolled++;
        } else if (student.status === StudentStatuses.InQueue){
            studentsInQueue++;
        }
        let listItem = document.createElement("li");
        listItem.innerHTML = createAndFillUserTemplate(student);
        studentsList.appendChild(listItem);
    })

    enrolledPar.textContent += studentsEnrolled.toString();
    pendingPar.textContent += studentsInQueue.toString();

    makeSubMainContainerVisible();
}

function createAndFillUserTemplate(studentData: StudentDataModel){
    let result = `
    <div class="student-div">
        <div class="student-div-main">
            <p class="student-name-par">${studentData.name}</p>
            <p class="student-status-par">Status: ${studentData.status}</p>
            <p class="student-email-par">${studentData.email}</p>
        </div>
        ${manageStudentStatus(studentData)}
    </div>
    `
    return result;
}

function manageStudentStatus(studentData: StudentDataModel):string{
    let result = ``;
    if (studentData.status === "InQueue"){
        result = `
            <div class="queued-student-div" id="queued-student-div-${studentData.id}">
                <button class="accept-button">Accept</button>
                <button class="decline-button">Decline</button>
            </div>
        `;
        const queuedStudentDiv = document.getElementById(`queued-student-div-${studentData.id}`);
        const acceptButton = queuedStudentDiv?.querySelector("#accept-button") as HTMLButtonElement;
        acceptButton.addEventListener("click", () => {acceptQueuedStudent(studentData.id, CourseStatuses.Accepted)})
        //TODO Check if accept button works, make the decline functionality
        const declineButton = queuedStudentDiv?.querySelector("#decline-button") as HTMLButtonElement;
    } else if (studentData.status === "Accepted"){
        result = `
        <div class="intermediate-attestation">
            <a>intermediate - </a>
            <div>${createAttestationStatusDiv(studentData.midtermResult)}</div>
        </div>
        <div class="final-attestation">
            <a>final - </a>
            <div>${createAttestationStatusDiv(studentData.midtermResult)}</div>
        </div>
        `;
    }else {
        return ``;
    }
    return result;
}


function createAttestationStatusDiv(intermetiateAttestationResult: string){
    let result = ``;
    if (intermetiateAttestationResult == "NotDefined"){
        result = `
        <div class="undefined-div">No mark</div>
        `;
    } else if (intermetiateAttestationResult == "Passed"){
        result = `
        <div class="passed-div">Success</div>
        `;
    } else{
        result = `
        <div class="failed-div">Failed</div>
        `;
    }
    return result;
}




async function getCourseInfo(){
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/details", {
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

async function acceptQueuedStudent(studentId: string, studentStatus: EditCourseStatusModel) {
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId +
        "/student-status/" + studentId, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + authData.token
        },
        body: JSON.stringify(studentStatus)
    })
    if (response.ok) {
        return (await response.json());
    }
    throw response;
}


function popupRedactStatus(){
    toggleRedactStatusPopup();

    var saveButton = document.getElementById("confirm-redact-status-button") as HTMLButtonElement;
    saveButton?.addEventListener("click", () => changeCourseStatus())
    saveButton.disabled = true;
    var cancelButton = document.getElementById("cancel-redact-status-button");
    cancelButton?.addEventListener("click", toggleRedactStatusPopup)

    const openedCheckbox = document.getElementById("opened-checkbox") as HTMLInputElement;
    const startedCheckbox = document.getElementById("started-checkbox") as HTMLInputElement;
    const finishedCheckbox = document.getElementById("finished-checkbox") as HTMLInputElement;
    openedCheckbox.onclick = () => {
        openedCheckbox.checked = false;
        startedCheckbox.checked = false;
        finishedCheckbox.checked = false;

        openedCheckbox.checked = true;
        saveButton.disabled = false;
    }
    startedCheckbox.onclick = () => {
        openedCheckbox.checked = false;
        startedCheckbox.checked = false;
        finishedCheckbox.checked = false;

        startedCheckbox.checked = true;
        saveButton.disabled = false;
    }
    finishedCheckbox.onclick = () => {
        openedCheckbox.checked = false;
        startedCheckbox.checked = false;
        finishedCheckbox.checked = false;

        finishedCheckbox.checked = true;
        saveButton.disabled = false;
    }

}

function toggleRedactStatusPopup(){
    var popup = document.getElementById("redact-status-span");
    popup?.classList.toggle("show");
}

async function changeCourseStatus(): Promise<void>{
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const authData = new AuthData();

    const openedCheckbox = document.getElementById("opened-checkbox") as HTMLInputElement;
    const startedCheckbox = document.getElementById("started-checkbox") as HTMLInputElement;
    // const finishedCheckbox = document.getElementById("finished-checkbox") as HTMLInputElement;

    let requestBody = {} as EditCourseStatusModel;
    openedCheckbox.checked ? requestBody = {status: CourseStatuses.OpenForAssigning} :
        startedCheckbox.checked ? requestBody = {status: CourseStatuses.Started} :
        requestBody = {status: CourseStatuses.Finished}

    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/status", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    if (response.ok) {
        toggleRedactStatusPopup();
        toggleSuccessPopup();
        const statusPar = document.getElementById("status-par");
        statusPar.textContent += "Status:" + requestBody.status.toString();
    }
    else {
        toggleFailurePopup();
    }
    throw response;
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

export {singleCoursePageConstructor};