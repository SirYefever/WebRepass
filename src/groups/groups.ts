import {addHtmlToPage, constructPage2} from "../index";
import groupsHtml from './groups.html?raw'
import redactPopupHtml from './popups/redactPopup.html?raw'
import createPopupHtml from './popups/newGroup.html?raw'
import deletePopupHtml from './popups/deletePopup.html?raw'
import {AuthData} from "../LocalDataStorage.ts";
import {CreateCampusGroupModel, EditCampusGroupModel, Group, UserRoles} from "../api/interfaces.ts";
import {getUserRoles} from "../utils/utils.ts";

async function groupsPageConstructor(){
    constructPage2(groupsHtml, "/src/groups/groups.css");
    addHtmlToPage(redactPopupHtml, "./src/groups/popups/popup.css");
    addHtmlToPage(createPopupHtml);
    addHtmlToPage(deletePopupHtml);
    const curUserRoles = await getUserRoles() as UserRoles;

    if (curUserRoles.isAdmin){
        const createNewButton = document.createElement("button");
        createNewButton?.addEventListener("click", popupCreate);
        createNewButton.textContent = "Add Group";
        const createNewDiv = document.querySelector("#create-new-div");
        createNewDiv?.appendChild(createNewButton);
    }
    displayGroupList();
}

async function displayGroupList(){
    const curUserRoles = await getUserRoles() as UserRoles;
    const groupList = document.querySelector("#group-list") as HTMLUListElement;
    groupList.innerHTML = "";
    const groups = await getGroups() as Group[];
    groups.forEach(group => {
        const groupLink = document.createElement("a");
        groupLink.id = "groupId=" + group.id;
        groupLink.href = `/groups/${group.id}`;
        groupLink.textContent = group.name;

        const linkDiv = document.createElement("div");
        linkDiv.appendChild(groupLink);

        if (curUserRoles.isAdmin)
        {
            const redactButton = document.createElement("button");
            redactButton.addEventListener("click", () => popupRedact(group.id));
            redactButton.textContent = "Redact";
            linkDiv.appendChild(redactButton);

            const deleteButton = document.createElement("button");
            deleteButton.addEventListener("click", ()=> popupDelete(group.id));
            deleteButton.textContent = "Delete";
            linkDiv.appendChild(deleteButton);
        }
        groupList.appendChild(linkDiv);
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




function popupCreate(){
    toggleCreatePopup();
    var saveButton = document.getElementById("confirm-create-button");
    saveButton?.addEventListener("click", () => createNewGroup())
    var cancelButton = document.getElementById("cancel-create-button");
    cancelButton?.addEventListener("click", cancelGroupCreation)
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
        displayGroupList();
        toggleCreatePopup();
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




function popupRedact(groupId: string) {
    toggleRedactPopup();
    var saveButton = document.getElementById("save-button");
    saveButton?.addEventListener("click", () => saveGroupChanges(groupId))
    var cancelButton = document.getElementById("cancel-button");
    cancelButton?.addEventListener("click", cancelGroupChanges)
}

function toggleRedactPopup(){
    var popup = document.getElementById("redact-popup-span");
    popup?.classList.toggle("show");
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
        toggleRedactPopup();
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
    toggleRedactPopup();
}




function popupDelete(groupId: string){
    toggleDeletePopup();
    var confirmButton = document.getElementById("confirm-delete-button");
    confirmButton?.addEventListener("click", () => deleteGroup(groupId))
    var cancelButton = document.getElementById("cancel-delete-button");
    cancelButton?.addEventListener("click", toggleDeletePopup);
}

function toggleDeletePopup(){
    var popup = document.getElementById("delete-popup-span");
    popup?.classList.toggle("show");
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
        toggleDeletePopup();
        displayGroupList();
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