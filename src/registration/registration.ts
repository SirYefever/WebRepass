import registrationHtml from './registration.html?raw'
import { DoctorRegisterModel } from '../api/interfaces'
import { GenderEnum } from '../api/interfaces'
import { SpecialityGetResponse } from '../api/interfaces'
import { constructPage } from '../index/index'
async function registerDoctorQuery(requestBody: DoctorRegisterModel) {
    let result = null;
    const response = await fetch("https://mis-api.kreosoft.space/api/doctor/register", {
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

async function getSpecialities(): Promise<SpecialityGetResponse> {
    const response = await fetch("https://mis-api.kreosoft.space/api/dictionary/speciality?page=1&size=100", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    if (response.ok) {
        return (await response.json()) as SpecialityGetResponse;
    }
    throw response;
}

async function regButtonOnclick() {
    let name = (document.getElementById("name-input") as HTMLInputElement).value;
    let gender = (document.getElementById("name-input") as HTMLSelectElement).value;
    let birthday = (document.getElementById("name-input") as HTMLSelectElement).value;
    let telephone = (document.getElementById("name-input") as HTMLInputElement).value;
    let speciality = (document.getElementById("name-input") as HTMLSelectElement).value;
    let email = (document.getElementById("name-input") as HTMLInputElement).value;
    let password = (document.getElementById("name-input") as HTMLInputElement).value;
    let doctorRegModel: DoctorRegisterModel = {};
    doctorRegModel!.name = name;
    doctorRegModel!.gender = gender === "Мужчина" ? GenderEnum.Male : GenderEnum.Female;
    doctorRegModel!.birthday = birthday;
    doctorRegModel!.phone = telephone;
    doctorRegModel!.speciality = speciality;
    doctorRegModel!.email = email;
    doctorRegModel!.password = password;
    registerDoctorQuery(doctorRegModel);
}

async function constructRegPage() {
    constructPage(registrationHtml);

    let specialities = (await getSpecialities() as SpecialityGetResponse).specialities;
    let specialitySelect = document.getElementById("speciality-select");
    specialities.forEach((element) => {
        let optionEl = document.createElement("option");
        optionEl.textContent = element.name!;
        specialitySelect?.appendChild(optionEl);
    });

    let regButton = document.getElementById("reg-button");
    regButton!.onclick = regButtonOnclick;
}

export { constructRegPage }