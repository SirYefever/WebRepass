import courseHtml from './singleCourse.html?raw'
import redactPopup from './popups/redactStatusPopup.html?raw'
import attestationHtml from './popups/attestation.html?raw'
import redactSummaryTeacherHtml from './popups/redactSummaryTeacher.html?raw'
import {addHtmlToPage, constructPage2, makeSubMainContainerVisible} from "../index";
import {
    CourseInfoModel,
    CourseStatuses, CourseTeacherModel, EditCampusCourseModel, EditCampusCourseRequirementsAndAnnotationsModel,
    EditCourseStatusModel,
    EditCourseStudentMarkModel,
    Mark,
    MarkType,
    StudentDataModel,
    StudentStatuses,
    UserRoles
} from "../api/interfaces.ts";
import {marked} from 'marked';
import {getUserRoles} from "../utils/utils.ts";
import {
    changeCourseStatusQuery, changeCourseSummaryAdminQuery,
    changeCourseSummaryTeacherQuery,
    changeQueuedStudentStatusQuery,
    getCourseInfoQuery
} from "./singleCourseQueries.ts";
import {changeAttestationMarkQuery} from "./singleCourseQueries.ts";

let mainTeacher: CourseTeacherModel;
let courseData: CourseInfoModel;


async function singleCoursePageConstructor(){
    constructPage2(courseHtml, "/src/singleCourse/singleCourse.css");
    addHtmlToPage(redactPopup, "/src/singleCourse/popups/popup.css");
    addHtmlToPage(attestationHtml);
    addHtmlToPage(redactSummaryTeacherHtml);
    courseData = await getCourseInfoQuery() as CourseInfoModel;
    const curUserRoles = await getUserRoles() as UserRoles;

    const courseNamePar = document.getElementById("course-name");
    // @ts-ignore
    courseNamePar.textContent = courseData.name;

    const summaryRedactButton = document.getElementById("redact-course-summary-button");
    summaryRedactButton.addEventListener("click", async () => {

    });

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
    // @ts-ignore
    statusPar.textContent += courseData.status;
    const yearPar = document.getElementById("year-par");
    // @ts-ignore
    yearPar.textContent += courseData.startYear.toString();
    const totalCountPar = document.getElementById("total-count-par");
    // @ts-ignore
    totalCountPar.textContent += courseData.maximumStudentsCount.toString();
    const semesterPar = document.getElementById("semester-par");
    // @ts-ignore
    semesterPar.textContent += courseData.semester;

    const requirementsPar = document.getElementById("requirements-content");
    // @ts-ignore
    requirementsPar.innerHTML = await marked(courseData.requirements);
    const annoPar = document.getElementById("anno-content");
    // @ts-ignore
    annoPar.innerHTML = await marked(courseData.requirements);

    const teachersList = document.getElementById("teachers-list") as HTMLUListElement;
    courseData.teachers.forEach(teacher => {
        if (teacher.isMain){
            mainTeacher = teacher;
        }

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
    await constructStudentsUl(courseData);

    makeSubMainContainerVisible();
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

    const openedCheckbox = document.getElementById("opened-checkbox") as HTMLInputElement;
    const startedCheckbox = document.getElementById("started-checkbox") as HTMLInputElement;
    // const finishedCheckbox = document.getElementById("finished-checkbox") as HTMLInputElement;

    let requestBody = {} as EditCourseStatusModel;
    openedCheckbox.checked ? requestBody = {status: CourseStatuses.OpenForAssigning} :
        startedCheckbox.checked ? requestBody = {status: CourseStatuses.Started} :
        requestBody = {status: CourseStatuses.Finished}

    const response = await changeCourseStatusQuery(requestBody);
    if (response.ok) {
        toggleRedactStatusPopup();
        toggleSuccessPopup();
        const statusPar = document.getElementById("status-par");
        // @ts-ignore
        statusPar.textContent = "Status:" + CourseStatuses[requestBody.status];
    }
    else {
        toggleFailurePopup();
    }
    throw response;
}




async function constructStudentsUl(courseDataInput?: CourseInfoModel){
    if (courseDataInput === null || courseDataInput === undefined){
        courseDataInput = await getCourseInfoQuery() as CourseInfoModel;
    }


    const studentsList = document.getElementById("students-list") as HTMLUListElement;
    studentsList.innerHTML = "";
    let studentsEnrolled = 0;
    let studentsInQueue = 0;
    courseDataInput.students.forEach(student => {
        if (student.status === StudentStatuses[StudentStatuses.Accepted]) {
            studentsEnrolled++;
        } else if (student.status === StudentStatuses[StudentStatuses.InQueue]){
            studentsInQueue++;
        }
        let listItem = document.createElement("li");
        listItem.appendChild(createAndFillUserTemplate(student));
        // listItem.innerHTML = createAndFillUserTemplate(student);
        studentsList.appendChild(listItem);
    })

    const pendingPar = document.getElementById("students-pending-par");
    const enrolledPar = document.getElementById("students-enrolled-par");

    // @ts-ignore
    enrolledPar.textContent += studentsEnrolled.toString();
    // @ts-ignore
    pendingPar.textContent += studentsInQueue.toString();
}

function createAndFillUserTemplate(studentData: StudentDataModel){
    const namePar = document.createElement("p");
    namePar.textContent = studentData.name;
    namePar.classList.add("student-name-par")

    const statusPar = document.createElement("p");
    statusPar.textContent = `Status: ${studentData.status}`;
    statusPar.classList.add("student-status-par")
    if (studentData.status === StudentStatuses[StudentStatuses.Accepted]) {
        statusPar.classList.add("student-accepted");
    } else {
        statusPar.classList.add("student-declined");
    }

    const emailPar = document.createElement("p");
    emailPar.textContent = studentData.email;
    emailPar.classList.add("student-email-par");


    const studentDiv = document.createElement("div");
    studentDiv.classList.add("student-div");

    const dataStudentDiv = document.createElement("div");
    dataStudentDiv.classList.add("student-div-main");
    dataStudentDiv.appendChild(namePar);
    dataStudentDiv.appendChild(statusPar);
    dataStudentDiv.appendChild(emailPar);
    studentDiv.appendChild(dataStudentDiv);
    const studentStatusDiv = manageStudentStatus(studentData);
    if (studentStatusDiv) {
        studentDiv.appendChild(<HTMLDivElement>manageStudentStatus(studentData));
    }
    return studentDiv;
}

function manageStudentStatus(studentData: StudentDataModel): HTMLDivElement | undefined  {
    if (studentData.status === StudentStatuses[StudentStatuses.InQueue]){
        const queuedStudentDiv = document.createElement("div");
        queuedStudentDiv.id = `queued-student-${studentData.id}`;
        queuedStudentDiv.classList.add("queued-student-div");

        const acceptButton = document.createElement("button");
        acceptButton.textContent = "Accept";
        acceptButton.classList.add("accept-button");
        acceptButton.addEventListener("click", () => {changeQueuedStudentStatus(studentData.id, StudentStatuses[StudentStatuses.Accepted])});
        queuedStudentDiv.appendChild(acceptButton);


        const declineButton = document.createElement("button");
        declineButton.textContent = "Decline";
        declineButton.classList.add("decline-button");
        declineButton.addEventListener("click", () => {changeQueuedStudentStatus(studentData.id, StudentStatuses[StudentStatuses.Declined])});
        queuedStudentDiv.appendChild(declineButton);

        return queuedStudentDiv;
    } else if (studentData.status === StudentStatuses[StudentStatuses.Accepted]){
        const attestationsDiv = document.createElement("div");
        attestationsDiv.classList.add("attestations-div");

        const intermediateAttestationDiv = document.createElement("div");
        let intermediateAttestation = document.createElement("button");
        intermediateAttestation.textContent = "Intermediate attestation - ";
        intermediateAttestation.id = `button-${studentData.id}`;
        intermediateAttestation?.addEventListener("click", () => popupRedactMark(MarkType.Midterm, studentData));

        intermediateAttestationDiv.appendChild(intermediateAttestation);
        // @ts-ignore
        intermediateAttestationDiv.appendChild(createAttestationStatusDiv(Mark[studentData.midtermResult]));
        attestationsDiv.appendChild(intermediateAttestationDiv);


        const finalAttestationDiv = document.createElement("div");
        const finalAttestation = document.createElement("button");
        finalAttestation.textContent = "Final attestation - ";
        finalAttestation.onclick = () => popupRedactMark(MarkType.Final, studentData);
        finalAttestationDiv.appendChild(finalAttestation);
        // @ts-ignore
        finalAttestationDiv.appendChild(createAttestationStatusDiv(Mark[studentData.finalResult]));
        attestationsDiv.appendChild(finalAttestationDiv);


        return attestationsDiv;
    } else {
        return;
    }
}

function createAttestationStatusDiv(mark: Mark){
    const div = document.createElement("div");
    div.classList.add("mark-div");
    if (mark === Mark.NotDefined){
        div.classList.add("undefined-div");
        div.textContent = "No mark"
    } else if (mark === Mark.Passed){
        div.classList.add("passed-div");
        div.textContent = "Success"
    } else {
        div.classList.add("failed-div");
        div.textContent = "Failed"
    }

    return div;
}

function popupRedactMark(markType: MarkType, studentData: StudentDataModel){
    toggleRedactMarkPopup();

    var saveButton = document.getElementById("confirm-redact-mark-button") as HTMLButtonElement;
    saveButton?.addEventListener("click", () => changeAttestationMark(studentData.id, markType))
    saveButton.disabled = true;
    var cancelButton = document.getElementById("cancel-redact-mark-button");
    cancelButton?.addEventListener("click", toggleRedactMarkPopup)

    const successCheckbox = document.getElementById("success-checkbox") as HTMLInputElement;

    const failCheckbox = document.getElementById("fail-checkbox") as HTMLInputElement;

    successCheckbox.onclick = () => {
        successCheckbox.checked = false;
        failCheckbox.checked = false;

        successCheckbox.checked = true;
        saveButton.disabled = false;
    }
    failCheckbox.onclick = () => {
        successCheckbox.checked = false;
        failCheckbox.checked = false;

        failCheckbox.checked = true;
        saveButton.disabled = false;
    }
}

function toggleRedactMarkPopup(){
    var popup = document.getElementById("redact-mark-span");
    popup?.classList.toggle("show");
}

async function changeAttestationMark(studentId: string, markType: MarkType): Promise<void>{

    const successCheckbox = document.getElementById("success-checkbox") as HTMLInputElement;

    const failCheckbox = document.getElementById("fail-checkbox") as HTMLInputElement;

    let requestBody = {} as EditCourseStudentMarkModel;
    successCheckbox.checked ? requestBody = {mark: Mark[Mark.Passed], markType: MarkType[markType]} :
        failCheckbox.checked ? requestBody = {mark: Mark[Mark.Failed], markType: MarkType[markType]} : {};

    const response = await changeAttestationMarkQuery(studentId, requestBody);
    if (response.ok) {
        toggleRedactMarkPopup();
        toggleSuccessPopup();
        await constructStudentsUl();
    }
    else {
        toggleFailurePopup();
    }
}



async function changeQueuedStudentStatus(studentId: string, studentStatus: string) {
    await changeQueuedStudentStatusQuery(studentId, studentStatus);
    await constructStudentsUl();
}



function popupRedactSummary(){
    toggleRedactSummaryPopup();
    const userRoles = await getUserRoles();

    if (userRoles.isAdmin){
        //save/cancel buttons, their 'onclicks'
    }

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

async function toggleRedactSummaryPopup(){
    const userRoles = await getUserRoles();

    if (userRoles.isAdmin){
        var popup = document.getElementById("redact-summary-admin-span");
        popup?.classList.toggle("show");
    } else {
        var popup = document.getElementById("redact-summary-teacher-span");
        popup?.classList.toggle("show");
    }
}




async function changeCourseSummaryTeacher(requestBody: EditCampusCourseRequirementsAndAnnotationsModel) {
    const response = await changeCourseSummaryTeacherQuery(requestBody);
    if (response.ok) {
        toggleRedactSummaryPopup();
        toggleSuccessPopup();
        //TODO: call refresh
    }
    else {
        toggleFailurePopup();
    }
}
async function changeCourseSummaryAdmin(requestBody: EditCampusCourseModel) {
    const response = await changeCourseSummaryAdminQuery(requestBody);
    if (response.ok) {
        toggleRedactSummaryPopup();
        toggleSuccessPopup();
        //TODO: call refresh
    }
    else {
        toggleFailurePopup();
    }
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