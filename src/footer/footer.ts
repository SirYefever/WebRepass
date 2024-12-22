import {UserLoginModel} from "../api/interfaces.ts";
import {AuthData, ProfileData} from "../LocalDataStorage.ts";
import {login} from "../login/login.ts";
import {loadCSS} from "../index";

function footerConstructor() {
    const loginAdminButton = document.getElementById('login-as-admin')! as HTMLButtonElement;
    loginAdminButton.onclick = loginAdmin;

    const loginStudentButton = document.getElementById('login-as-student')! as HTMLButtonElement;
    loginStudentButton.onclick = loginStudent;
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
    let loginData: UserLoginModel = { email:"user@test.com", password:"qwerty1"};
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = "user@test.com";
        window.location.reload();
    }
    storage.token = token;
}

export {footerConstructor};