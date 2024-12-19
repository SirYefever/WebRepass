import loginHTML from './login.html?raw'
import { refillSubMainContainer } from '../index/index'
import { constructPage } from '../index/index'
import { AuthData } from "../LocalDataStorage.ts";
import { profileLogic } from "../profile/profile.ts";


async function login(requestBody: object) {
    let result = null;
    const response = await fetch("https://mis-api.kreosoft.space/api/doctor/login", {
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
    const token = await login({ email: emailInput.value, password: passwordInput.value });
    const storage = new AuthData();
    storage.token = token;
    await profileLogic();

    window.location.assign('/profile');
}

function loginConstructor() {
    window.localStorage.clear();
    constructPage(loginHTML);
    const loginButton = document.getElementById('loginButtonSelector')! as HTMLButtonElement;
    loginButton.onclick = loginLogic
    const registerButton = document.getElementById('registerButtonSelector')! as HTMLButtonElement;
    loginButton.onclick = () => {
        window.location.pathname = "/registration";
    };
}

export { login, loginConstructor }
