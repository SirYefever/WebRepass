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
    UserRoles
} from "../api/interfaces.ts";
import {marked} from 'marked';
import {getUserRoles} from "../utils/utils.ts";
import {
    changeQueuedStudentStatusQuery,
    getCourseInfoQuery
} from "./singleCourseQueries.ts";
import {popupRedactSummary} from "./redactCourseInfo.ts";
import {popupRedactStatus} from "./redactCourseStatus.ts";
import {popupRedactMark} from "./redactMark.ts";
import {getUserRolesFast} from "../queries/usersQueries.ts";
import {getCurrentUserProfileInfoQuery} from "../queries/accountQueries.ts";

export let mainTeacher: CourseTeacherModel;
let courseData: CourseInfoModel;
let userRoles: UserRoles;

async function singleCoursePageConstructor(){
    constructPage2(courseHtml, "/src/singleCourse/singleCourse.css");
    addHtmlToPage(redactPopup, "/src/singleCourse/popups/popup.css");
    addHtmlToPage(attestationHtml);
    if ((await getUserRolesFast()).isAdmin){
        addHtmlToPage(redactSummaryAdminHtml);
    } else if (mainTeacher.email === (await getCurrentUserProfileInfoQuery()).email){
        addHtmlToPage(redactSummaryTeacherHtml);
    }

    courseData = await getCourseInfoQuery() as CourseInfoModel;
    userRoles = await getUserRoles() as UserRoles;

    await constructAndFillSummary();

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

    $(document).ready(function() {
        $('.summernote').summernote();
    });
    $('.summernote').summernote({
        dialogsInBody: true
    });
}

async function constructAndFillSummary(){
    courseData = await getCourseInfoQuery() as CourseInfoModel;

    const courseNamePar = document.getElementById("course-name") as HTMLParagraphElement;
    courseNamePar.textContent = courseData.name;


    const statusDiv = document.querySelector(".status-par-and-button-div") as HTMLDivElement;
    if (userRoles.isAdmin || userRoles.isTeacher){// Wrong??? One has to be a teacher for this specific course,
        // not just for any course out there.
        const summaryRedactButton = document.getElementById("redact-course-summary-button") as HTMLButtonElement;
        summaryRedactButton.addEventListener("click", async () => {
            await popupRedactSummary();
        });

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





export { constructStudentsUl, constructAndFillSummary, getSemesterFromCheckboxes, singleCoursePageConstructor};