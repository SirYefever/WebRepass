import {
        EditCampusCourseModel,
        EditCampusCourseRequirementsAndAnnotationsModel,
        UserInfoModel,
        UserModel,
} from "../api/interfaces.ts";
import {changeCourseSummaryAdminQuery, changeCourseSummaryTeacherQuery} from "./singleCourseQueries.ts";
import {getCurrentUserProfileInfoQuery} from "../queries/accountQueries.ts";
import {
        constructAndFillSummary,
        getSemesterFromCheckboxes, mainTeacher,
} from "./singleCourse.ts";
// import {get} from "jquery";
import {fetchUsers, getUserRolesFast} from "../queries/usersQueries.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";

async function clearSummaryPopupContents(){
        if ((await getUserRolesFast()).isAdmin) {
                clearAdminSummaryPopup();
        } else {
                clearMainTeacherSummaryPopup();
        }
}

function clearAdminSummaryPopup(){
        const redactSummaryDiv = document.getElementById("redact-summary-admin-div") as HTMLInputElement;
        const courseNameInput = redactSummaryDiv.querySelector("#new-course-name") as HTMLInputElement;
        const startYearInput = redactSummaryDiv.querySelector("#new-course-start-year") as HTMLInputElement;
        const maximumStudentCountInput = redactSummaryDiv.querySelector("#new-course-maximum-student-count") as HTMLInputElement;
        const springCheckbox = document.getElementById("spring") as HTMLInputElement;
        const autumnCheckbox = document.getElementById("autumn") as HTMLInputElement;
        const mainTeacherSelect = redactSummaryDiv.querySelector("#teacher-select") as HTMLSelectElement;
        const teacherNameInput = redactSummaryDiv.querySelector("#teacher-name-input") as HTMLInputElement;
        springCheckbox.checked = false;
        autumnCheckbox.checked = false;
        redactSummaryDiv.value = "";
        courseNameInput.value = "";
        startYearInput.value = "";
        maximumStudentCountInput.value = "";
        $('#requirements-div-admin').summernote('code', '');
        $('#annotations-div-admin').summernote('code', '');
        mainTeacherSelect.value = "";
        teacherNameInput.value = "";
}

function clearMainTeacherSummaryPopup() {
        $('#requirements-div-teacher').summernote('code', '');
        $('#annotations-div-teacher').summernote('code', '');
}

function collectDataOverRedactSummaryFormForAdmin(): EditCampusCourseModel{
        const redactSummaryDiv = document.getElementById("redact-summary-admin-div") as HTMLInputElement;
        const courseNameInput = redactSummaryDiv.querySelector("#new-course-name") as HTMLInputElement;
        const startYearInput = redactSummaryDiv.querySelector("#new-course-start-year") as HTMLInputElement;
        const maximumStudentCountInput = redactSummaryDiv.querySelector("#new-course-maximum-student-count") as HTMLInputElement;
        const reqContent: string = $('#requirements-div-admin').summernote('code');
        const annoContent: string = $('#annotations-div-admin').summernote('code');
        const mainTeacherSelect = redactSummaryDiv.querySelector("#teacher-select") as HTMLSelectElement;


        const editSummaryModel = {
                name: courseNameInput.value,
                startYear: parseInt(startYearInput.value),
                maximumStudentsCount: parseInt(maximumStudentCountInput.value),
                semester: getSemesterFromCheckboxes(),
                requirements: reqContent,
                annotations: annoContent,
                mainTeacherId: mainTeacherSelect?.selectedOptions[0].dataset.info
        } as EditCampusCourseModel

        return editSummaryModel;
}

function collectDataOverRedactSummaryFormForMainTeacher(): EditCampusCourseRequirementsAndAnnotationsModel{
        const reqContent: string = $('#requirements-div-teacher').summernote('code');
        const annoContent: string = $('#annotations-div-teacher').summernote('code');

        const editSummaryModel = {
                requirements: reqContent,
                annotations: annoContent
        } as EditCampusCourseRequirementsAndAnnotationsModel;

        return editSummaryModel;
}

async function popupRedactSummary(){
        const userRoles = await getUserRolesFast();
        toggleRedactSummaryPopup();
        await clearSummaryPopupContents();
        if (userRoles.isAdmin){
                await popupAdminRedactSummary();
        } else {
                const curUserEmail = ((await (await getCurrentUserProfileInfoQuery()).json()) as UserInfoModel).email;
                if (curUserEmail !== mainTeacher.email){
                        return;
                }
                const saveButton = document.getElementById("confirm-redact-summary-teacher-button");
                saveButton?.addEventListener("click", async () => {
                        const response = await changeCourseSummaryTeacherQuery(collectDataOverRedactSummaryFormForMainTeacher());
                        if (response.ok) {
                                toggleSuccessPopup();
                                toggleRedactSummaryPopup();
                                await constructAndFillSummary();
                                clearSummaryPopupContents();
                        } else {
                                toggleFailurePopup();
                        }
                })
                const cancelButton = document.getElementById("cancel-redact-summary-teacher-button");
                cancelButton?.addEventListener("click", async () => { await popupRedactSummary(); })
        }
}

async function popupAdminRedactSummary(){

        const users = await fetchUsers() as UserModel[];
        const redactSummaryDiv = document.getElementById("redact-summary-admin-div") as HTMLInputElement;
        fillTeacherSelectWithUsers(users);

        const teacherNameInput = redactSummaryDiv.querySelector("#teacher-name-input") as HTMLInputElement;
        teacherNameInput.onchange = () => {
                let subUsers = [] as UserModel[];
                users.forEach((user) => {
                        if (user.fullName.includes(<string>teacherNameInput?.value)) {
                                subUsers.push(user);
                        }
                })
                fillTeacherSelectWithUsers(subUsers);
        }

        const saveButton = document.getElementById("confirm-redact-summary-admin-button");
        saveButton?.addEventListener("click", async () => {
                const editSummaryModel = collectDataOverRedactSummaryFormForAdmin();
                const response = await changeCourseSummaryAdminQuery(editSummaryModel);
                if (response.ok) {
                        toggleSuccessPopup();
                        toggleRedactSummaryPopup();
                        await constructAndFillSummary();
                        clearSummaryPopupContents();
                } else{
                        toggleFailurePopup();
                }
        })
        const cancelButton = document.getElementById("cancel-redact-summary-admin-button");
        cancelButton?.addEventListener("click", async () => { toggleRedactSummaryPopup(); })
}



function compareUsersAlphabetically(firstUser: UserModel, secondUser: UserModel){
        return firstUser.fullName.localeCompare(secondUser.fullName);
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


async function toggleRedactSummaryPopup(){
        if ((await getUserRolesFast()).isAdmin){
                var popup = document.getElementById("redact-summary-admin-span");
                popup?.classList.toggle("show");
        } else {
                var popup = document.getElementById("redact-summary-teacher-span");
                popup?.classList.toggle("show");
        }
}

export {popupRedactSummary}