import courseHtml from './singleCourse.html?raw'
import redactPopup from './popups/redactStatusPopup.html?raw'
import attestationHtml from './popups/attestation.html?raw'
import redactSummaryTeacherHtml from './popups/redactSummaryTeacher.html?raw'
import redactSummaryAdminHtml from './popups/redactSumarryAdmin.html?raw'
import {addHtmlToPage, constructPage2, makeSubMainContainerVisible} from "../index";
import {
    CourseInfoModel,
    CourseTeacherModel,
    Mark,
    MarkType,
    StudentDataModel,
    StudentStatuses,
} from "../api/interfaces.ts";
import {marked} from 'marked';
import {
    changeQueuedStudentStatusQuery,
    getCourseInfoQuery
} from "./singleCourseQueries.ts";
import {popupRedactSummary} from "./redactCourseInfo.ts";
import {popupRedactStatus} from "./redactCourseStatus.ts";
import {initRedactMarkPopup, toggleRedactMarkPopupOn} from "./redactMark.ts";
import {getCurrentUserProfileInfoQuery} from "../queries/accountQueries.ts";
import {ProfileData} from "../LocalDataStorage.ts";

export let mainTeacher: CourseTeacherModel;
let courseData: CourseInfoModel;
export let isUserAdminOrMainTeacher: boolean = false;


async function singleCoursePageConstructor(){
    constructPage2(courseHtml, "/src/singleCourse/singleCourse.css");
    addHtmlToPage(redactPopup, "/src/singleCourse/popups/popup.css");
    addHtmlToPage(attestationHtml);
    addHtmlToPage(redactSummaryAdminHtml);
    addHtmlToPage(redactSummaryTeacherHtml);

    initRedactMarkPopup();

    courseData = await getCourseInfoQuery() as CourseInfoModel;
    courseData.teachers.forEach(teacher => {
        if (teacher.isMain){
            mainTeacher = teacher;
        }
    })
    await defineIfUserAdminOrMainTeacher();
    await constructAndFillSummary();

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

    await constructStudentsUl(courseData);

    makeSubMainContainerVisible();

    $(document).ready(function() {
        $('.summernote').summernote();
    });
    $('.summernote').summernote({
        dialogsInBody: true
    });
}

async function updatePageContent(){
    const subMainContainer = document.getElementById("sub-main-container") as HTMLUListElement;
    subMainContainer.innerHTML = courseHtml;
    courseData = await getCourseInfoQuery() as CourseInfoModel;

    courseData = await getCourseInfoQuery() as CourseInfoModel;
    courseData.teachers.forEach(teacher => {
        if (teacher.isMain){
            mainTeacher = teacher;
        }
    })
    await defineIfUserAdminOrMainTeacher();
    await constructAndFillSummary();

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

    await constructStudentsUl(courseData);

    makeSubMainContainerVisible();

    $(document).ready(function() {
        $('.summernote').summernote();
    });
    $('.summernote').summernote({
        dialogsInBody: true
    });
}

async function constructAndFillSummary() {

    const courseNamePar = document.getElementById("course-name") as HTMLParagraphElement;
    courseNamePar.textContent = courseData.name;

    const nameAndRedactSummaryButtonDiv = document.getElementById("summary-and-redact-button") as HTMLDivElement;

    const statusDiv = document.querySelector(".status-par-and-button-div") as HTMLDivElement;
    if (isUserAdminOrMainTeacher) {
        const summaryRedactButton = document.createElement("button");
        summaryRedactButton.textContent = "Redact course info";
        summaryRedactButton.addEventListener("click", () => {
            popupRedactSummary();
        });

        nameAndRedactSummaryButtonDiv.appendChild(summaryRedactButton);

        const redactStatusButton = document.createElement("button");
        redactStatusButton.textContent = "Change status";
        redactStatusButton.addEventListener("click", () => {
            popupRedactStatus();
        })


        statusDiv.appendChild(redactStatusButton);
    }



    const statusPar = document.getElementById("status-par") as HTMLParagraphElement;
    statusPar.textContent += courseData.status;
    const yearPar = document.getElementById("year-par") as HTMLParagraphElement;
    yearPar.textContent += courseData.startYear.toString();
    const totalCountPar = document.getElementById("total-count-par") as HTMLParagraphElement;
    totalCountPar.textContent += courseData.maximumStudentsCount.toString();
    const semesterPar = document.getElementById("semester-par") as HTMLParagraphElement;
    semesterPar.textContent += courseData.semester;

    const requirementsPar = document.getElementById("requirements-content") as HTMLDivElement;
    requirementsPar.innerHTML = await marked(courseData.requirements);
    const annoPar = document.getElementById("anno-content") as HTMLDivElement;
    annoPar.innerHTML = await marked(courseData.requirements);
}



async function constructStudentsUl(courseDataInput?: CourseInfoModel){
    if (courseDataInput === null || courseDataInput === undefined){
        courseDataInput = await getCourseInfoQuery() as CourseInfoModel;
    }

    const studentsList = document.getElementById("students-list") as HTMLUListElement;
    studentsList.innerHTML = "";
    let studentsEnrolled = 0;
    let studentsInQueue = 0;
    courseDataInput.students.forEach(async(student) =>  {
        if (student.status === StudentStatuses[StudentStatuses.Accepted]) {
            studentsEnrolled++;
        } else if (student.status === StudentStatuses[StudentStatuses.InQueue]){
            studentsInQueue++;
        }
        let listItem = document.createElement("li");
        listItem.appendChild(await createAndFillUserTemplate(student));
        studentsList.appendChild(listItem);
    })

    const pendingPar = document.getElementById("students-pending-par") as HTMLParagraphElement;
    const enrolledPar = document.getElementById("students-enrolled-par") as HTMLParagraphElement;

    enrolledPar.textContent += studentsEnrolled.toString();
    pendingPar.textContent += studentsInQueue.toString();
}

async function createAndFillUserTemplate(studentData: StudentDataModel){
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
    const studentStatusDiv = await manageStudentStatus(studentData);
    if (studentStatusDiv) {
        studentDiv.appendChild(studentStatusDiv);
    }
    return studentDiv;
}

async function manageStudentStatus(studentData: StudentDataModel): Promise<HTMLDivElement | undefined>  {
    if (!isUserAdminOrMainTeacher) {
        return;
    }
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
        intermediateAttestation?.addEventListener("click", () => toggleRedactMarkPopupOn(MarkType.Midterm, studentData));//TODO: change the function

        intermediateAttestationDiv.appendChild(intermediateAttestation);
        // @ts-ignore
        intermediateAttestationDiv.appendChild(createAttestationStatusDiv(Mark[studentData.midtermResult]));
        attestationsDiv.appendChild(intermediateAttestationDiv);


        const finalAttestationDiv = document.createElement("div");
        const finalAttestation = document.createElement("button");
        finalAttestation.textContent = "Final attestation - ";
        finalAttestation.onclick = () => toggleRedactMarkPopupOn(MarkType.Final, studentData);
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



async function changeQueuedStudentStatus(studentId: string, studentStatus: string) {
    await changeQueuedStudentStatusQuery(studentId, studentStatus);
    await constructStudentsUl();
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



async function defineIfUserAdminOrMainTeacher(): Promise<void> {
    const userInfo = new ProfileData();
    isUserAdminOrMainTeacher = (userInfo.userRoles.isAdmin || mainTeacher.email === (await getCurrentUserProfileInfoQuery()).email);
}


export { updatePageContent, defineIfUserAdminOrMainTeacher, constructStudentsUl, constructAndFillSummary, getSemesterFromCheckboxes, singleCoursePageConstructor};