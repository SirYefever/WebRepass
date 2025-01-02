import {AddCampusCourseNotificationModel} from "../api/interfaces.ts";
import {AuthData} from "../LocalDataStorage.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";
import {updateNotifications} from "./singleCourse.ts";

function initNewNotificationPopup(){
      const textArea = document.getElementById("new-notification-textarea") as HTMLTextAreaElement;
      const isImportantCheckbox = document.getElementById("is-important-checkbox") as HTMLInputElement;

      const saveButton = document.getElementById("save-new-notification-button") as HTMLButtonElement;
      saveButton.addEventListener("click", async () => {
            const newNotification = {text: textArea.value, isImportant: isImportantCheckbox.checked} as AddCampusCourseNotificationModel;
            await newNotificationQuery(newNotification);
      })

      const cancelButton = document.getElementById("cancel-new-notification-button") as HTMLButtonElement;
      cancelButton.addEventListener("click", () => {
            toggleNewNotificationPopupOff();
      })
}

function toggleNewNotificationPopupOn(){
      const popup = document.getElementById("new-notification-popup-span") as HTMLSpanElement;
      popup?.classList.add("show");
}

function toggleNewNotificationPopupOff(){
      const popup = document.getElementById("new-notification-popup-span") as HTMLSpanElement;
      popup?.classList.remove("show");
}

async function newNotificationQuery(notification: AddCampusCourseNotificationModel){
      const urlSplit = window.location.pathname.split("/");
      const courseId = urlSplit[urlSplit.length - 1];
      const authData = new AuthData();
      const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/notifications", {
            method: "POST",
            headers: {
                  Authorization: "Bearer " + authData.token,
                  "Content-Type": "application/json"
            },
            body: JSON.stringify(notification)
      });
      if (response.ok) {
            toggleSuccessPopup();
            toggleNewNotificationPopupOff();
            await updateNotifications();
            return (await response.json());
      }
      toggleFailurePopup();
      throw response;
}

export {initNewNotificationPopup, toggleNewNotificationPopupOn}