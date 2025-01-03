import {UserLoginModel, UserRegisterModel} from "../api/interfaces.ts";
import {AuthData, ProfileData} from "../LocalDataStorage.ts";
import {login} from "../login/login.ts";
import {loadCSS} from "../index";
import {setUserRoles} from "../queries/usersQueries.ts";

function footerConstructor() {
    const loginAdminButton = document.getElementById('login-as-admin')! as HTMLButtonElement;
    loginAdminButton.onclick = loginAdmin;

    const loginAsMainTeacher = document.getElementById('login-as-main-teacher')! as HTMLButtonElement;
    loginAsMainTeacher.onclick = loginMainTeacher;

    const loginAsTeacher = document.getElementById('login-as-teacher')! as HTMLButtonElement;
    loginAsTeacher.onclick = loginTeacher;

    const loginStudentButton = document.getElementById('login-as-student')! as HTMLButtonElement;
    loginStudentButton.onclick = loginStudent;

    const loginUserButton = document.getElementById('login-as-user')! as HTMLButtonElement;
    loginUserButton.onclick = loginUser;

    const testBindButton = document.getElementById('test-bind-function')! as HTMLButtonElement;
    testBindButton.onclick = bind;


    loadCSS("/src/footer/footer.css");
}

async function loginAdmin(){
    let loginData: UserLoginModel = { email:"gymboss@gachi.com", password:"B0yNextD00r"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        let userData = new ProfileData();
        userData.email = "gymboss@gachi.com";
    }
    storage.token = token;
    await setUserRoles();
    window.location.reload();
}

async function loginMainTeacher(){
    let loginData: UserLoginModel = { email:"user@test.ru", password:"qwerty1"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = "user@test.ru";
    }
    storage.token = token;
    await setUserRoles();
    window.location.reload();
}


async function loginTeacher(){
    let loginData: UserLoginModel = { email:"user@test.teacher", password:"qwerty1"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = "user@test.teacher";
    }
    storage.token = token;
    await setUserRoles();
    window.location.reload();
}

async function loginStudent(){
    let loginData: UserLoginModel = { email:"user@test.student", password:"qwerty1"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = "user@student.com";
    }
    storage.token = token;
    await setUserRoles();
    window.location.reload();
}

async function loginUser(){
    let loginData: UserLoginModel = { email:"user@test.com", password:"qwerty1"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = "user@test.com";
    }
    storage.token = token;
    await setUserRoles();
    window.location.reload();
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
    const courseId = "08d5bd6a-c1a1-4059-e329-08dd2b1b5782";
    const requestUrl ="https://camp-courses.api.kreosoft.space/courses/" + courseId + "/sign-up" ;
    const response = await fetch(requestUrl, {
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


export {footerConstructor};