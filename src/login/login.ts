import loginHTML from './login.html?raw'
import {constructPage2, makeSubMainContainerVisible} from '../index/index'
import {AuthData, ProfileData} from "../LocalDataStorage.ts";
import { UserLoginModel } from '../api/interfaces.ts';
import {footerConstructor} from "../footer/footer.ts";
import {setUserRoles} from "../queries/usersQueries.ts";


async function login(requestBody: object) {
    localStorage.removeItem("data");
    localStorage.removeItem("profile");
    localStorage.removeItem("userRoles");
    const response = await fetch("https://camp-courses.api.kreosoft.space/login", {
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

async function loginLogic() {
    const emailInput = document.getElementById('emailSelector')! as HTMLInputElement;
    const passwordInput = document.getElementById('password-input-selector')! as HTMLInputElement;
    let loginData: UserLoginModel = { email:emailInput.value, password:passwordInput.value };
    const token = await login(loginData);
    const storage = new AuthData();
    if (token !== null)
    {
        const userData = new ProfileData();
        userData.email = emailInput.value;
        window.location.reload();
    }
    storage.token = token;
    await setUserRoles();
}


function loginConstructor() {
    constructPage2(loginHTML, "/src/login/login.css");
    const loginButton = document.getElementById('loginButtonSelector')! as HTMLButtonElement;
    loginButton.onclick = loginLogic

    footerConstructor();
    makeSubMainContainerVisible();
}

export { login, loginConstructor }
