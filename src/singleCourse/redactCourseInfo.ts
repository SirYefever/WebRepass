import {
        CourseInfoModel,
        EditCampusCourseModel,
        EditCampusCourseRequirementsAndAnnotationsModel,
        UserInfoModel,
        UserModel,
} from "../api/interfaces.ts";
import {
        changeCourseSummaryAdminQuery,
        changeCourseSummaryTeacherQuery,
        getCourseInfoQuery
} from "./singleCourseQueries.ts";
import {getCurrentUserProfileInfoQuery} from "../queries/accountQueries.ts";
import {
        constructAndFillSummary,
        getSemesterFromCheckboxes, mainTeacher, updatePageContent,
} from "./singleCourse.ts";
// import {get} from "jquery";
import {fetchUsers, setUserRoles} from "../queries/usersQueries.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";
import {ProfileData} from "../LocalDataStorage.ts";
import {isNullOrEmpty} from "../utils/utils.ts";

function clearSummaryPopupContents(){
        const userInfo = new ProfileData;
        if (userInfo.userRoles.isAdmin) {
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

async function collectDataOverRedactSummaryFormForAdmin(): Promise<EditCampusCourseModel> {
        const courseData = await getCourseInfoQuery() as CourseInfoModel;
        const redactSummaryDiv = document.getElementById("redact-summary-admin-div") as HTMLInputElement;
        const courseNameInput = redactSummaryDiv.querySelector("#new-course-name") as HTMLInputElement;
        const startYearInput = redactSummaryDiv.querySelector("#new-course-start-year") as HTMLInputElement;
        const maximumStudentCountInput = redactSummaryDiv.querySelector("#new-course-maximum-student-count") as HTMLInputElement;
        const reqContent: string = $('#requirements-div-admin').summernote('code');
        const annoContent: string = $('#annotations-div-admin').summernote('code');
        const mainTeacherSelect = redactSummaryDiv.querySelector("#teacher-select") as HTMLSelectElement;


        return {
                name: (isNullOrEmpty(courseNameInput.value) ? courseData.name : courseNameInput.value),
                startYear: isNullOrEmpty(startYearInput.value) ? courseData.startYear : parseInt(startYearInput.value),
                maximumStudentsCount: isNullOrEmpty(maximumStudentCountInput.value) ? courseData.maximumStudentsCount : parseInt(maximumStudentCountInput.value),
                semester: (getSemesterFromCheckboxes() === null) ? courseData.semester : getSemesterFromCheckboxes(),
                requirements: isNullOrEmpty(reqContent) ? courseData.requirements : reqContent,
                annotations: isNullOrEmpty(annoContent) ? courseData.annotations : annoContent,
                mainTeacherId: mainTeacherSelect?.selectedOptions[0].dataset.info
        } as EditCampusCourseModel;
}

function collectDataOverRedactSummaryFormForMainTeacher(): EditCampusCourseRequirementsAndAnnotationsModel{
        const reqContent: string = $('#requirements-div-teacher').summernote('code');
        const annoContent: string = $('#annotations-div-teacher').summernote('code');


        return {
                requirements: reqContent,
                annotations: annoContent
        } as EditCampusCourseRequirementsAndAnnotationsModel;
}

async function popupRedactSummary(){
        const userRoles = new ProfileData().userRoles;

        toggleRedactSummaryPopup();
        // clearSummaryPopupContents();
        if (userRoles.isAdmin){
                await popupAdminRedactSummary();
        } else {
                await popupTeacherRedactSummary();
        }
}

async function popupTeacherRedactSummary(){
        const curUserEmail = ((await getCurrentUserProfileInfoQuery()) as UserInfoModel).email;
        if (curUserEmail !== mainTeacher.email){
                return;
        }
        const saveButton = document.getElementById("confirm-redact-summary-teacher-button");
        saveButton?.addEventListener("click", async () => {
                const response = await changeCourseSummaryTeacherQuery(collectDataOverRedactSummaryFormForMainTeacher());
                if (response.ok) {
                        toggleSuccessPopup();
                        toggleRedactSummaryPopup();
                        await updatePageContent();
                } else {
                        toggleFailurePopup();
                }
        })
        const cancelButton = document.getElementById("cancel-redact-summary-teacher-button");
        cancelButton?.addEventListener("click", async () => { await popupRedactSummary(); })
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
                const editSummaryModel = await collectDataOverRedactSummaryFormForAdmin();
                const response = await changeCourseSummaryAdminQuery(editSummaryModel);
                if (response.ok) {
                        toggleSuccessPopup();
                        toggleRedactSummaryPopup();
                        await updatePageContent();
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


function toggleRedactSummaryPopup(){
        const userInfo = new ProfileData;
        if (userInfo.userRoles.isAdmin){
                var popup = document.getElementById("redact-summary-admin-span");
                popup?.classList.toggle("show");
        } else {
                var popup = document.getElementById("redact-summary-teacher-span");
                popup?.classList.toggle("show");
        }
}

export {popupRedactSummary}