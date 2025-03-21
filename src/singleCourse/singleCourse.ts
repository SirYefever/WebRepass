import courseHtml from './singleCourse.html?raw'
import redactPopup from './popups/redactStatusPopup.html?raw'
import attestationHtml from './popups/attestation.html?raw'
import redactSummaryTeacherHtml from './popups/redactSummaryTeacher.html?raw'
import redactSummaryAdminHtml from './popups/redactSumarryAdmin.html?raw'
import newTeacherHtml from './popups/newTeacherPopup.html?raw'
import newNotificationHtml from './popups/newNotification.html?raw'
import {addHtmlToPage, constructPage2, loadCSS, makeSubMainContainerVisible} from "../index";
import {
    CourseInfoModel,
    Mark,
    MarkType,
    StudentDataModel,
    StudentStatuses,
    UserAuthority,
    UserInfoModel,
    UserRolesForCourse,
} from "../api/interfaces.ts";
import {marked} from 'marked';
import {assignForCourseQuery, changeQueuedStudentStatusQuery, getCourseInfoQuery} from "./singleCourseQueries.ts";
import {initRedactSummaryAdmin, initRedactSummaryTeacher, popupRedactSummary,} from "./redactCourseInfo.ts";
import {initPopupRedactStatus, popupRedactStatus} from "./redactCourseStatus.ts";
import {initRedactMarkPopup, toggleRedactMarkPopupOn} from "./redactMark.ts";
import {getCurrentUserProfileInfoQuery} from "../queries/accountQueries.ts";
import {ProfileData} from "../LocalDataStorage.ts";
import {initNewTacherPopup, newTeacherPopupOn} from "./newTeacher.ts";
import {initNewNotificationPopup, toggleNewNotificationPopupOn} from "./newNotification.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";

let courseData: CourseInfoModel;
export let userRolesForCourse: UserRolesForCourse;


async function singleCoursePageConstructor(){
    constructPage2(courseHtml, "/src/singleCourse/singleCourse.css");
    addHtmlToPage(redactPopup, "/src/singleCourse/popups/popup.css");
    addHtmlToPage(attestationHtml);
    addHtmlToPage(redactSummaryAdminHtml);
    addHtmlToPage(redactSummaryTeacherHtml);
    addHtmlToPage(newTeacherHtml);
    addHtmlToPage(newNotificationHtml);
    loadCSS("/src/defaultPopups/defaultPopups.css");


    courseData = await getCourseInfoQuery() as CourseInfoModel;
    await setUserRolesInsideCourse(courseData);

    if (userRolesForCourse.userAuthority >= UserAuthority.MainTeacher) {
        initRedactMarkPopup();
        initRedactSummaryAdmin();
        initRedactSummaryTeacher();
        initPopupRedactStatus();
        await initNewTacherPopup();
        initNewNotificationPopup();
    }

    await constructAndFillSummary();

    if (userRolesForCourse.userAuthority >= UserAuthority.MainTeacher) {
        const newTeacherButton = document.getElementById("new-teacher-button") as HTMLButtonElement;
        newTeacherButton.classList.remove("invisible");
        newTeacherButton.addEventListener("click", () => {
            newTeacherPopupOn();
        });

        const newNotificationButton = document.getElementById("new-notification") as HTMLButtonElement;
        newNotificationButton.classList.remove("invisible");
        newNotificationButton.addEventListener("click", () => {
            toggleNewNotificationPopupOn();
        })
    }

    await updateNotifications(courseData);


    const teachersList = document.getElementById("teachers-list") as HTMLDivElement;
    teachersList.innerHTML = "";
    courseData.teachers.forEach(teacher => {
        let listItem = document.createElement("div");
        listItem.setAttribute("id", "teacher-list-item");
        listItem.classList.add("teacher-div");

        const fullNamePar = document.createElement("p");
        fullNamePar.textContent = teacher.name + " ";
        fullNamePar.classList.add("student-name-par");
        listItem.appendChild(fullNamePar);

        const emailPar = document.createElement("p");
        emailPar.textContent = teacher.email;
        emailPar.classList.add("student-name-par");
        listItem.appendChild(emailPar);

        if (teacher.isMain) {
            const isMainLabel = document.createElement("label");
            isMainLabel.textContent = "- Главный преподаватель";
            isMainLabel.classList.add("main-teacher-label");
            fullNamePar.appendChild(isMainLabel);
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

async function updateNotifications(courseData?: CourseInfoModel) {
    if (courseData === null || courseData === undefined) {
        courseData = await getCourseInfoQuery() as CourseInfoModel;
    }

    const notificationsList = document.getElementById("notifications-list") as HTMLDivElement;
    notificationsList.innerHTML = "";
    courseData.notifications.forEach(notif => {
        let notifDiv = document.createElement("div");
        notifDiv.classList.add("notif-div");

        const notifText = document.createElement("p");
        notifText.classList.add("notif-text");
        notifText.textContent = notif.text;

        if (notif.isImportant){
            notifDiv.classList.add("important-notify");
        }

        notifDiv.appendChild(notifText);

        notificationsList.appendChild(notifDiv);
    });
}

async function updatePageContent2(){
    courseData = await getCourseInfoQuery() as CourseInfoModel;
    const courseNamePar = document.getElementById("course-name") as HTMLParagraphElement;
    courseNamePar.textContent = courseData.name;
    await setUserRolesInsideCourse(courseData);
    await constructAndFillSummary();

    const teachersList = document.getElementById("teachers-list") as HTMLUListElement;
    teachersList.innerHTML = "";
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

}

async function constructAndFillSummary() {

    const courseNamePar = document.getElementById("course-name") as HTMLAnchorElement;
    courseNamePar.textContent = courseData.name;

    const nameAndRedactSummaryButtonDiv = document.querySelector(".course-name-div") as HTMLDivElement;

    const statusDiv = document.querySelector("#status-piece-div") as HTMLDivElement;
    if (userRolesForCourse.userAuthority >= UserAuthority.MainTeacher) {
        if (document.getElementById("summary-redact-button") === null){
            const summaryRedactButton = document.createElement("button");
            summaryRedactButton.textContent = "Редактировать курс";
            summaryRedactButton.id = "summary-redact-button";
            summaryRedactButton.addEventListener("click", () => {
                // popupRedactSummary();//TODO change?
                popupRedactSummary();
            });
            nameAndRedactSummaryButtonDiv.appendChild(summaryRedactButton);
        }

        if (document.getElementById("redact-status-button") === null){
            const redactStatusButton = document.createElement("button");
            redactStatusButton.classList.add("change-status-button");
            redactStatusButton.textContent = "Изменить статус";
            redactStatusButton.id = "redact-status-button";
            redactStatusButton.addEventListener("click", () => {
                popupRedactStatus();
            })

            statusDiv.appendChild(redactStatusButton);
        }

    } else if (userRolesForCourse.userAuthority <= UserAuthority.InQueue){
        if (document.getElementById("assign-button") === null){
            const assignButton = document.createElement("button");
            assignButton.textContent = "Записаться на курс";
            assignButton.classList.add("assign-button");
            assignButton.id = "assign-button";
            if (userRolesForCourse.userAuthority === UserAuthority.InQueue){
                assignButton.disabled = true;
            }
            assignButton.addEventListener("click", async() => {
                const response = await assignForCourseQuery();
                if (response.ok){
                    toggleSuccessPopup();
                    assignButton.disabled = true;
                }else{
                    toggleFailurePopup();
                }
            });
            nameAndRedactSummaryButtonDiv.appendChild(assignButton);
        }
    }


    const statusTranslationMap = new Map<string, string>();
    statusTranslationMap.set("Created", "Создан");
    statusTranslationMap.set("OpenForAssigning", "Открыт для записи");
    statusTranslationMap.set("Started", "В процессе обучения");
    statusTranslationMap.set("Finished", "Закончен");

    const statusPar = document.getElementById("status-par") as HTMLParagraphElement;
    // @ts-ignore
    statusPar.textContent = statusTranslationMap.get(courseData.status);
    const yearPar = document.getElementById("year-par") as HTMLParagraphElement;
    yearPar.textContent = courseData.startYear.toString();
    const totalCountPar = document.getElementById("total-count-par") as HTMLParagraphElement;
    totalCountPar.textContent = courseData.maximumStudentsCount.toString();


    const semesterTranslationMap = new Map<string, string>();
    semesterTranslationMap.set("Autumn", "Осенний");
    semesterTranslationMap.set("Spring", "Весенний");

    const semesterPar = document.getElementById("semester-par") as HTMLParagraphElement;
    // @ts-ignore
    semesterPar.textContent = semesterTranslationMap.get(courseData.semester);

    const requirementsPar = document.getElementById("requirements-content") as HTMLDivElement;
    requirementsPar.innerHTML = await marked(courseData.requirements);
    const annoPar = document.getElementById("anno-content") as HTMLDivElement;
    annoPar.innerHTML = await marked(courseData.annotations);
}



async function constructStudentsUl(courseDataInput?: CourseInfoModel){
    if (courseDataInput === null || courseDataInput === undefined){
        courseDataInput = await getCourseInfoQuery() as CourseInfoModel;
    }

    const studentsList = document.getElementById("students-list") as HTMLDivElement;
    studentsList.innerHTML = "";
    let studentsEnrolled = 0;
    let studentsInQueue = 0;
    courseDataInput.students.forEach(async(student) =>  {
        if (student.status === StudentStatuses[StudentStatuses.Accepted]) {
            studentsEnrolled++;
            studentsList.appendChild(await createAndFillUserTemplate(student));
        } else if (student.status === StudentStatuses[StudentStatuses.InQueue]){
            studentsInQueue++;
            if (userRolesForCourse.userAuthority >= UserAuthority.MainTeacher){
                studentsList.appendChild(await createAndFillUserTemplate(student));
            }
        } else if (student.status === StudentStatuses[StudentStatuses.Declined]){
            studentsList.appendChild(await createAndFillUserTemplate(student));
        }
    })

    const pendingPar = document.getElementById("students-pending-par") as HTMLParagraphElement;
    const enrolledPar = document.getElementById("students-enrolled-par") as HTMLParagraphElement;

    enrolledPar.textContent = studentsEnrolled.toString();
    pendingPar.textContent = studentsInQueue.toString();
}



async function createAndFillUserTemplate(studentData: StudentDataModel){
    const namePar = document.createElement("p");
    namePar.textContent = studentData.name;
    namePar.classList.add("student-name-par");

    const statusPar = document.createElement("p");
    statusPar.textContent = `Статуc: ${studentData.status}`;
    statusPar.classList.add("student-status-par")
    statusPar.classList.add("student-name-par")
    if (studentData.status === StudentStatuses[StudentStatuses.Accepted]) {
        statusPar.classList.add("student-accepted");
    } else if (studentData.status === StudentStatuses[StudentStatuses.InQueue]){
        statusPar.classList.add("student-in-queue");
    } else if (studentData.status === StudentStatuses[StudentStatuses.Declined]){
        statusPar.classList.add("student-declined");
    }

    const emailPar = document.createElement("p");
    emailPar.textContent = studentData.email;
    emailPar.classList.add("student-email-par");
    emailPar.classList.add("student-name-par");


    const studentDiv = document.createElement("div");
    studentDiv.classList.add("student-div");

    const dataStudentDiv = document.createElement("div");
    dataStudentDiv.classList.add("student-div-main");
    dataStudentDiv.appendChild(namePar);
    dataStudentDiv.appendChild(statusPar);
    dataStudentDiv.appendChild(emailPar);
    studentDiv.appendChild(dataStudentDiv);
    if (studentData.status === StudentStatuses[StudentStatuses.Accepted]) {
        const studentStatusDiv = await manageAcceptedStudentStatus(studentData);
        if (studentStatusDiv) {
            studentDiv.appendChild(studentStatusDiv);
        }
    } else if (studentData.status === StudentStatuses[StudentStatuses.InQueue]) {
        const studentStatusDiv = await manageQueuedStudentStatus(studentData);
        if (studentStatusDiv) {
            studentDiv.appendChild(studentStatusDiv);
        }
    } else if (studentData.status === StudentStatuses[StudentStatuses.Declined]) {

    }
    return studentDiv;
}

async function manageAcceptedStudentStatus(studentData: StudentDataModel): Promise<HTMLDivElement | undefined>  {
    if ((userRolesForCourse.userAuthority <= UserAuthority.Student)) {
        return;
    }

    if (userRolesForCourse.userAuthority === UserAuthority.Teacher) {
        const attestationsDiv = document.createElement("div");
        attestationsDiv.classList.add("attestations-div");

        const intermediateAttestationDiv = document.createElement("div");
        intermediateAttestationDiv.classList.add("attestation-div");
        let intermediateAttestation = document.createElement("p");
        intermediateAttestation.textContent = "Промежуточная аттестация";
        intermediateAttestation.id = `par-${studentData.id}`;
        intermediateAttestation.classList.add("student-name-par");

        intermediateAttestationDiv.appendChild(intermediateAttestation);
        // @ts-ignore
        intermediateAttestationDiv.appendChild(createAttestationStatusDiv(Mark[studentData.midtermResult]));
        attestationsDiv.appendChild(intermediateAttestationDiv);

        const finalAttestationDiv = document.createElement("div");
        finalAttestationDiv.classList.add("attestation-div");
        const finalAttestation = document.createElement("p");
        finalAttestation.textContent = "Итоговая аттестация";
        finalAttestationDiv.appendChild(finalAttestation);
        finalAttestation.classList.add("student-name-par");
        // @ts-ignore
        finalAttestationDiv.appendChild(createAttestationStatusDiv(Mark[studentData.finalResult]));
        attestationsDiv.appendChild(finalAttestationDiv);

        return attestationsDiv;
    }

    if (userRolesForCourse.userAuthority >= UserAuthority.MainTeacher){
        const attestationsDiv = document.createElement("div");
        attestationsDiv.classList.add("attestations-div");

        const intermediateAttestationDiv = document.createElement("div");
        intermediateAttestationDiv.classList.add("attestation-div");
        let intermediateAttestation = document.createElement("button");
        intermediateAttestation.classList.add("attestation-button");
        intermediateAttestation.textContent = "Промежуточная аттестация";
        intermediateAttestation.id = `button-${studentData.id}`;
        intermediateAttestation?.addEventListener("click", () => toggleRedactMarkPopupOn(MarkType.Midterm, studentData));//TODO: change the function

        intermediateAttestationDiv.appendChild(intermediateAttestation);
        // @ts-ignore
        intermediateAttestationDiv.appendChild(createAttestationStatusDiv(Mark[studentData.midtermResult]));
        attestationsDiv.appendChild(intermediateAttestationDiv);

        const finalAttestationDiv = document.createElement("div");
        finalAttestationDiv.classList.add("attestation-div");
        const finalAttestation = document.createElement("button");
        finalAttestation.classList.add("attestation-button");
        finalAttestation.textContent = "Итоговая аттестация";
        finalAttestation.onclick = () => toggleRedactMarkPopupOn(MarkType.Final, studentData);
        finalAttestationDiv.appendChild(finalAttestation);
        // @ts-ignore
        finalAttestationDiv.appendChild(createAttestationStatusDiv(Mark[studentData.finalResult]));
        attestationsDiv.appendChild(finalAttestationDiv);

        return attestationsDiv;
    }
    return;
}

async function manageQueuedStudentStatus(studentData: StudentDataModel): Promise<HTMLDivElement | undefined>  {

    if ((userRolesForCourse.userAuthority <= UserAuthority.Student)) {
        return;
    }

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
}

function createAttestationStatusDiv(mark: Mark){
    const div = document.createElement("div");
    div.classList.add("mark-div");
    if (mark === Mark.NotDefined){
        div.classList.add("undefined-div");
        div.textContent = "Отметка отсутсвует"
    } else if (mark === Mark.Passed){
        div.classList.add("passed-div");
        div.textContent = "Зачет"
    } else {
        div.classList.add("failed-div");
        div.textContent = "Провал"
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

function setUserAuthority(authority: UserAuthority, userRoles: UserRolesForCourse){
    userRoles.userAuthority = Math.max(userRoles.userAuthority, authority);
}

async function setUserRolesInsideCourse(courseData?: CourseInfoModel, userData?: UserInfoModel){
    userRolesForCourse =  {userAuthority: UserAuthority.User} as UserRolesForCourse;
    if (courseData === null || courseData === undefined){
        courseData = await getCourseInfoQuery() as CourseInfoModel;
    }

    if (userData === null || userData === undefined){
        userData = await getCurrentUserProfileInfoQuery();
    }

    const userInfo = new ProfileData();
    if (userInfo.userRoles.isAdmin){
        setUserAuthority(UserAuthority.Administrator, userRolesForCourse);
        return;
    }

    courseData.teachers.forEach(teacher => {
        if (teacher.isMain) {
            if (teacher.email === userData.email){
                setUserAuthority(UserAuthority.MainTeacher, userRolesForCourse);
                return;
            }
        }

        if (teacher.email === userData.email){
            setUserAuthority(UserAuthority.Teacher, userRolesForCourse);
            return;
        }
    })

    courseData?.students.forEach(student => {
        if (student.email === userData.email && student.status === StudentStatuses[StudentStatuses.InQueue]){
            setUserAuthority(UserAuthority.InQueue, userRolesForCourse);
            return;
        }
    })

    courseData?.students.forEach(student => {
        if (student.email === userData.email){
            setUserAuthority(UserAuthority.Student, userRolesForCourse);
            return;
        }
    })
    setUserAuthority(UserAuthority.User, userRolesForCourse);
}


export { updateNotifications, updatePageContent2, constructStudentsUl, constructAndFillSummary, getSemesterFromCheckboxes, singleCoursePageConstructor};