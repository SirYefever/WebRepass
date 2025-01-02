import {AuthData} from "../LocalDataStorage.ts";
import {
    EditCampusCourseModel,
    EditCampusCourseRequirementsAndAnnotationsModel,
    EditCourseStatusModel,
    EditCourseStudentMarkModel
} from "../api/interfaces.ts";

async function getCourseInfoQuery(){
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

async function changeQueuedStudentStatusQuery(studentId: string, studentStatus: string): Promise<Response> {
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const body = {status: studentStatus};
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId +
        "/student-status/" + studentId, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    if (response.ok) {
        return (response);
    }
    throw response;
}


async function changeCourseStatusQuery(requestBody: EditCourseStatusModel): Promise<Response> {
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/status", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    return response;

}

async function changeAttestationMarkQuery(studentId: string, requestBody: EditCourseStudentMarkModel){
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/marks/" + studentId, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    return response;
}


async function changeCourseSummaryTeacherQuery(requestBody: EditCampusCourseRequirementsAndAnnotationsModel) {
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/requirements-and-annotations", {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    return response;
}

async function changeCourseSummaryAdminQuery(requestBody: EditCampusCourseModel) {
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    return response;
}

async function assignForCourseQuery(){
    const urlSplit = window.location.pathname.split("/");
    const courseId = urlSplit[urlSplit.length - 1];
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/sign-up", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authData.token,
        }
    })
    return response;
}

export { assignForCourseQuery, changeCourseSummaryAdminQuery, changeCourseSummaryTeacherQuery, changeAttestationMarkQuery, getCourseInfoQuery, changeQueuedStudentStatusQuery, changeCourseStatusQuery};