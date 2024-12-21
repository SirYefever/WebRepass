import registrationHtml from './registration.html?raw'
import { UserRegisterModel } from '../api/interfaces'
import { GenderEnum } from '../api/interfaces'
import { SpecialityGetResponse } from '../api/interfaces'
import { constructPage, constructPage2 } from '../index/index'
import { AuthData } from '../LocalDataStorage'

async function registerUserQuery(requestBody: UserRegisterModel) {
    let result = null;
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

async function regButtonOnclick() {
    let fullName = (document.getElementById("name-input") as HTMLInputElement).value;
    let birthDate = (document.getElementById("birthday-select") as HTMLSelectElement).value;
    let email = (document.getElementById("email-input") as HTMLInputElement).value;
    let password = (document.getElementById("password-input") as HTMLInputElement).value;
    let confirmPassword = (document.getElementById("confirm-password-input") as HTMLInputElement).value;
    let userRegModel: UserRegisterModel = {};
    userRegModel!.fullName = fullName;
    userRegModel!.birthDate = birthDate;
    userRegModel!.email = email;
    userRegModel!.password = password;
    userRegModel!.confirmPassword = confirmPassword;
    const token = await registerUserQuery(userRegModel);
    const storage = new AuthData();
    storage.token = token;
}

async function constructRegPage() {
    constructPage2(registrationHtml, "/src/registration/registration.css");
    let regButton = document.getElementById("reg-button");
    regButton!.onclick = regButtonOnclick;
}

export { constructRegPage }