import {addHtmlToPage, constructPage2, makeSubMainContainerVisible} from "../index";
import groupsHtml from './groups.html?raw'
import redactPopupHtml from './popups/redactPopup.html?raw'
import createPopupHtml from './popups/newGroup.html?raw'
import deletePopupHtml from './popups/deletePopup.html?raw'
import {AuthData} from "../LocalDataStorage.ts";
import {CreateCampusGroupModel, EditCampusGroupModel, Group, UserRoles} from "../api/interfaces.ts";
import {getUserRoles} from "../utils/utils.ts";

async function groupsPageConstructor(){
    constructPage2(groupsHtml, "/src/groups/groups.css");
    addHtmlToPage(redactPopupHtml, "/src/groups/popups/popup.css");// deleted '.' symbol from start of the path
    addHtmlToPage(createPopupHtml);
    addHtmlToPage(deletePopupHtml);
    const curUserRoles = await getUserRoles() as UserRoles;

    if (curUserRoles.isAdmin){
        initPopupCreate();
        initPopupRedact();
        initPopupDelete();

        const createNewButton = document.createElement("button");
        createNewButton?.addEventListener("click", toggleCreatePopup);
        createNewButton.textContent = "Add Group";
        createNewButton.classList.add("create-new-group-button");

        const nameDiv = document.querySelector(".name-div");
        nameDiv?.appendChild(createNewButton);
    }
    await displayGroupList();
    makeSubMainContainerVisible();
}

async function displayGroupList(){
    const curUserRoles = await getUserRoles() as UserRoles;
    const groupsDiv = document.querySelector("#main-groups-div-id") as HTMLDivElement;
    groupsDiv.innerHTML = "";
    const groups = await getGroups() as Group[];
    groups.forEach(group => {
        const groupLink = document.createElement("a");
        groupLink.classList.add("group-link");
        groupLink.id = "groupId=" + group.id;
        groupLink.href = `/groups/${group.id}`;
        groupLink.textContent = group.name;

        const linkDiv = document.createElement("div");
        linkDiv.classList.add("link-div");
        linkDiv.appendChild(groupLink);

        if (curUserRoles.isAdmin)
        {
            const buttonsDiv = document.createElement("div");
            buttonsDiv.classList.add("buttons-div");

            const redactButton = document.createElement("button");
            redactButton.addEventListener("click", () => toggleRedactPopupOn(group.id));
            redactButton.textContent = "Redact";
            redactButton.classList.add("groups-button");


            const deleteButton = document.createElement("button");
            deleteButton.addEventListener("click", ()=> toggleDeletePopupOn(group.id));
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("groups-button");

            buttonsDiv.appendChild(redactButton);
            buttonsDiv.appendChild(deleteButton);

            linkDiv.appendChild(buttonsDiv);

            redactButton.addEventListener("mouseenter", () => {
                const color = "#5f4b8b";
                linkDiv.style.backgroundColor = color;
                redactButton.style.backgroundColor = color;
                deleteButton.style.backgroundColor = color;
                groupLink.style.color = "white";
            });
            redactButton.addEventListener("mouseleave", () => {
                linkDiv.style.backgroundColor = "";
                redactButton.style.backgroundColor = "";
                deleteButton.style.backgroundColor = "";
                groupLink.style.color = "";
            });

            deleteButton.addEventListener("mouseenter", () => {
                const color = "#ea6759";
                linkDiv.style.backgroundColor = color;
                redactButton.style.backgroundColor = color;
                deleteButton.style.backgroundColor = color;
                groupLink.style.color = "white";
            });
            deleteButton.addEventListener("mouseleave", () => {
                linkDiv.style.backgroundColor = "";
                redactButton.style.backgroundColor = "";
                deleteButton.style.backgroundColor = "";
                groupLink.style.color = "";
            });
        }
        groupsDiv.appendChild(linkDiv);
    })
}

async function getGroups() {
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/groups", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + authData.token
        }
    })
    if (response.ok) {
        return (await response.json());
    }
    throw response;
}



function initPopupCreate() {
    var saveButton = document.getElementById("confirm-create-button");
    saveButton?.addEventListener("click", () => createNewGroup())
    var cancelButton = document.getElementById("cancel-create-button");
    cancelButton?.addEventListener("click", cancelGroupCreation)
}

function clearCreatePopupForm(){
    const groupName = document.getElementById("new-group-name") as HTMLInputElement;
    groupName.value = "";
}

function toggleCreatePopup(){
    var popup = document.getElementById("create-popup-span");
    popup?.classList.toggle("show");
}

async function createNewGroup(): Promise<void>{
    const groupName = document.getElementById("new-group-name") as HTMLInputElement;
    const createModel = {name: groupName.value} as CreateCampusGroupModel;

    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/groups", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(createModel)
    })
    if (response.ok) {
        toggleSuccessPopup();
        await displayGroupList();
        toggleCreatePopup();
        clearCreatePopupForm();
    }
    else {
        toggleFailurePopup();
    }
    throw response;
}

function cancelGroupCreation(){
    const newNameInput = document.getElementById("confirm-create-button") as HTMLInputElement;
    newNameInput.value = "";
    toggleCreatePopup();
}



function initPopupRedact(){
    var cancelButton = document.getElementById("cancel-button");
    cancelButton?.addEventListener("click", cancelGroupChanges)
}

function toggleRedactPopupOn(groupId: string){
    const popup = document.getElementById("redact-popup-span");
    popup?.classList.add("show");

    const saveButton = document.getElementById("save-button") as HTMLButtonElement;
    const newSaveButton = saveButton.cloneNode(true) as HTMLButtonElement;
    newSaveButton.addEventListener("click", () => saveGroupChanges(groupId))
    saveButton?.parentNode?.replaceChild(newSaveButton, saveButton);
}

function toggleRedactPopupOff(){
    const popup = document.getElementById("redact-popup-span");
    popup?.classList.remove("show");
}

async function saveGroupChanges(id: string): Promise<void> {
    const newNameInput = document.getElementById("new-name") as HTMLInputElement;
    const requestBody = {name: newNameInput.value} as EditCampusGroupModel;
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/groups/" + id, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + authData.token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
    })
    if (response.ok) {
        const groupLink = document.getElementById("groupId=" + id) as HTMLAnchorElement;
        groupLink.textContent = newNameInput.value;
        toggleRedactPopupOff();
        toggleSuccessPopup();
    }
    else {
        toggleFailurePopup();
    }
    throw response;
}

function cancelGroupChanges(){
    const newNameInput = document.getElementById("new-name") as HTMLInputElement;
    newNameInput.value = "";
    toggleRedactPopupOff();
}



function initPopupDelete(){
    const cancelButton = document.getElementById("cancel-delete-button");
    cancelButton?.addEventListener("click", toggleDeletePopupOff);
}

function toggleDeletePopupOn(groupId: string){
    const popup = document.getElementById("delete-popup-span");
    popup?.classList.add("show");

    const confirmButton = document.getElementById("confirm-delete-button") as HTMLButtonElement;
    const newConfirmButton = confirmButton.cloneNode(true) as HTMLButtonElement;
    newConfirmButton.addEventListener("click", () => deleteGroup(groupId))
    confirmButton.parentNode?.replaceChild(newConfirmButton, confirmButton);
}

function toggleDeletePopupOff() {
    var popup = document.getElementById("delete-popup-span");
    popup?.classList.remove("show");
}

async function deleteGroup(id: string): Promise<void> {
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/groups/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + authData.token,
        }
    })
    if (response.ok) {
        toggleDeletePopupOff();
        await displayGroupList();
        toggleSuccessPopup();
    }
    else {
        toggleFailurePopup();
    }
    throw response;
}




function toggleSuccessPopup(){
    const failurePopup = document.getElementById("failure-div")
    if (failurePopup){
        failurePopup.remove();
    }
    const successPopup = document.getElementById("success-div")
    if (successPopup){
        successPopup.remove();
    }

    var popupDiv = document.createElement("div");
    popupDiv.classList.add("popup");
    popupDiv.classList.add("success-div");
    popupDiv.id = "success-div";

    var popupSpan = document.createElement("span");
    popupSpan.classList.add("popuptext");
    popupSpan.classList.add("success-popup-span");
    popupSpan.id = "success-popup-span";

    var popupPar = document.createElement("p");
    popupPar.textContent = "Success";

    popupSpan.appendChild(popupPar);
    popupDiv.appendChild(popupSpan);

    const popupStack = document.getElementById("popup-stack") as HTMLDivElement;
    popupStack?.appendChild(popupDiv);

    popupSpan?.classList.toggle("show");
    setTimeout(() => {
        popupSpan?.classList.add("fade-out");
        setTimeout(() => {
            popupSpan?.classList.toggle("show")
            popupSpan?.classList.remove("fade-out");
            popupDiv.remove();
        }, 500);
    }, 1500);
}

function toggleFailurePopup(){
    const failurePopup = document.getElementById("failure-div")
    if (failurePopup){
        failurePopup.remove();
    }
    const successPopup = document.getElementById("success-div")
    if (successPopup){
        successPopup.remove();
    }

    var popupDiv = document.createElement("div");
    popupDiv.classList.add("popup");
    popupDiv.classList.add("failure-div");
    popupDiv.id = "failure-div";

    var popupSpan = document.createElement("span");
    popupSpan.classList.add("popuptext");
    popupSpan.classList.add("failure-popup-span");
    popupSpan.id = "failure-popup-span";

    var popupPar = document.createElement("p");
    popupPar.textContent = "Fail";

    popupSpan.appendChild(popupPar);
    popupDiv.appendChild(popupSpan);

    const popupStack = document.getElementById("popup-stack") as HTMLDivElement;
    popupStack?.appendChild(popupDiv);

    popupSpan?.classList.toggle("show");
    setTimeout(() => {
        popupSpan?.classList.add("fade-out");
        setTimeout(() => {
            popupSpan?.classList.toggle("show")
            popupSpan?.classList.remove("fade-out");
            popupDiv.remove();
        }, 500);
    }, 1500);
}

export {groupsPageConstructor};