import loginHTML from './login.html?raw'
import { constructPage2, refillSubMainContainer } from '../index/index'
import { constructPage } from '../index/index'
import { AuthData } from "../LocalDataStorage.ts";
import { profileLogic } from "../profile/profile.ts";
import { UserLoginModel } from '../api/interfaces.ts';


async function login(requestBody: object) {
    let result = null;
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
    storage.token = token;
}

function loginConstructor() {
    window.localStorage.clear();
    constructPage2(loginHTML, "/src/login/login.css");
    const loginButton = document.getElementById('loginButtonSelector')! as HTMLButtonElement;
    loginButton.onclick = loginLogic
    const registerButton = document.getElementById('registerButtonSelector')! as HTMLButtonElement;
    registerButton.onclick = () => {
        window.location.pathname = "/registration";
    };
}

export { login, loginConstructor }
