import registrationHtml from './registration.html?raw'
import { UserRegisterModel } from '../api/interfaces'
import {constructPage2, loadCSS, makeSubMainContainerVisible} from '../index/index'
import {AuthData, ProfileData} from '../LocalDataStorage'
import {setUserRoles} from "../queries/usersQueries.ts";
import {toggleFailurePopup} from "../defaultPopups/defaultPopups.ts";

async function registerUserQuery(requestBody: UserRegisterModel) {
    const response = await fetch("https://camp-courses.api.kreosoft.space/registration", {
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

async function regButtonOnclick() {
    let fullName = (document.getElementById("name-input") as HTMLInputElement).value;
    let birthDate = (document.getElementById("birthday-select") as HTMLSelectElement).value;
    let email = (document.getElementById("email-input") as HTMLInputElement).value;
    let password = (document.getElementById("password-input") as HTMLInputElement).value;
    let confirmPassword = (document.getElementById("confirm-password-input") as HTMLInputElement).value;
    let userRegModel: UserRegisterModel = {
        fullName: fullName,
        birthDate: birthDate,
        email: email,
        password: password,
        confirmPassword: confirmPassword
    };
    const token = await registerUserQuery(userRegModel);
    const storage = new AuthData();
    storage.token = token;
    const profileData = new ProfileData();
    profileData.email = email;
    await setUserRoles();
    window.location.href = "/groups";
}

async function constructRegPage() {
    constructPage2(registrationHtml, "/src/registration/registration.css");
    loadCSS("/src/defaultPopups/defaultPopups.css");
    let regButton = document.getElementById("reg-button");
    regButton!.onclick = regButtonOnclick;
    makeSubMainContainerVisible();
}

export { constructRegPage }