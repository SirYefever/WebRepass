import {UserLoginModel, UserRegisterModel} from "../api/interfaces.ts";
import {AuthData, ProfileData} from "../LocalDataStorage.ts";
import {login} from "../login/login.ts";
import {loadCSS} from "../index";

function footerConstructor() {
    const loginAdminButton = document.getElementById('login-as-admin')! as HTMLButtonElement;
    loginAdminButton.onclick = loginAdmin;

    const loginStudentButton = document.getElementById('login-as-student')! as HTMLButtonElement;
    loginStudentButton.onclick = loginStudent;

    const testBindButton = document.getElementById('test-bind-function')! as HTMLButtonElement;
    testBindButton.onclick = bind;

    const loginAsTeacher = document.getElementById('login-as-teacher')! as HTMLButtonElement;
    loginAsTeacher.onclick = loginTeacher;

    loadCSS("/src/footer/footer.css");
}

async function loginAdmin(){
    let loginData: UserLoginModel = { email:"gymboss@gachi.com", password:"B0yNextD00r"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = "gymboss@gachi.com";
        window.location.reload();
    }
    storage.token = token;
}

async function loginStudent(){
    let loginData: UserLoginModel = { email:"user@test.ru", password:"qwerty1"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = "user@test.ru";
        window.location.reload();
    }
    storage.token = token;
}


async function bind(){
    await signUpForCourse(await registerUserQuery());
}


async function registerUserQuery() {
    const requestBody = {fullName: generateRandomString(), birthDate: "2023-12-29T08:33:27.896Z",
        email: generateRandomString() + "@mail.ru", password: "qwerty1", confirmPassword: "qwerty1"} as UserRegisterModel;
    const response = await fetch("https://camp-courses.api.kreosoft.space/registration", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
            "Content-Type": "application/json",
        },
    })
    if (response.ok) {
        return (await response.json())['token'] as string;
    }
    throw response;
}

async function signUpForCourse(token: string){
    const courseId = "34008266-112d-4046-1e84-08dd281e240c";
    const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/sign-up", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    if (response.ok) {
        return (await response.json());
    }
    throw response;
}

function generateRandomString(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function loginTeacher(){
    let loginData: UserLoginModel = { email:"user@test.ru", password:"qwerty1"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = "user@test.ru";
        window.location.reload();
    }
    storage.token = token;
}

export {footerConstructor};