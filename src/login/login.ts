import loginHTML from './login.html?raw'
import {constructPage2, loadCSS, makeSubMainContainerVisible} from '../index/index'
import {AuthData, ProfileData} from "../LocalDataStorage.ts";
import { UserLoginModel } from '../api/interfaces.ts';
import {footerConstructor} from "../footer/footer.ts";
import {setUserRoles} from "../queries/usersQueries.ts";
import {toggleFailurePopup} from "../defaultPopups/defaultPopups.ts";


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
    }else{
        toggleFailurePopup();
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
        window.location.href = "/groups";
    }
    storage.token = token;
    const profileData = new ProfileData();
    profileData.email = emailInput.value;
    await setUserRoles();
}


function loginConstructor() {
    constructPage2(loginHTML, "/src/login/login.css");
    loadCSS("/src/defaultPopups/defaultPopups.css");
    const loginButton = document.getElementById('loginButtonSelector')! as HTMLButtonElement;
    loginButton.onclick = loginLogic

    footerConstructor();
    makeSubMainContainerVisible();
}

export { login, loginConstructor }
