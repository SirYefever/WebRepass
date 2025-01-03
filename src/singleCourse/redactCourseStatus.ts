import {CourseStatuses, EditCourseStatusModel} from "../api/interfaces.ts";
import {changeCourseStatusQuery} from "./singleCourseQueries.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";

function initPopupRedactStatus(){
      var saveButton = document.getElementById("confirm-redact-status-button") as HTMLButtonElement;
      saveButton?.addEventListener("click", () => changeCourseStatus())
      saveButton.disabled = true;
      var cancelButton = document.getElementById("cancel-redact-status-button");
      cancelButton?.addEventListener("click", () => popupRedactStatus())

      const openedCheckbox = document.getElementById("opened-checkbox") as HTMLInputElement;
      const startedCheckbox = document.getElementById("started-checkbox") as HTMLInputElement;
      const finishedCheckbox = document.getElementById("finished-checkbox") as HTMLInputElement;

      openedCheckbox.onclick = () => {
            openedCheckbox.checked = false;
            startedCheckbox.checked = false;
            finishedCheckbox.checked = false;

            openedCheckbox.checked = true;
            saveButton.disabled = false;
      }
      startedCheckbox.onclick = () => {
            openedCheckbox.checked = false;
            startedCheckbox.checked = false;
            finishedCheckbox.checked = false;

            startedCheckbox.checked = true;
            saveButton.disabled = false;
      }
      finishedCheckbox.onclick = () => {
            openedCheckbox.checked = false;
            startedCheckbox.checked = false;
            finishedCheckbox.checked = false;

            finishedCheckbox.checked = true;
            saveButton.disabled = false;
      }
}

function popupRedactStatus(){
      togglePopup();

      const openedCheckbox = document.getElementById("opened-checkbox") as HTMLInputElement;
      const startedCheckbox = document.getElementById("started-checkbox") as HTMLInputElement;
      const finishedCheckbox = document.getElementById("finished-checkbox") as HTMLInputElement;
      openedCheckbox.checked = false;
      startedCheckbox.checked = false;
      finishedCheckbox.checked = false;

      const confirmButton = document.getElementById("confirm-redact-status-button") as HTMLButtonElement;
      confirmButton.disabled = true;
}

function togglePopup(){
      var popup = document.getElementById("redact-status-span");
      popup?.classList.toggle("show");
}

async function changeCourseStatus(): Promise<void>{
      const openedCheckbox = document.getElementById("opened-checkbox") as HTMLInputElement;
      const startedCheckbox = document.getElementById("started-checkbox") as HTMLInputElement;
      const finishedCheckbox = document.getElementById("finished-checkbox") as HTMLInputElement;

      let requestBody = {} as EditCourseStatusModel;
      openedCheckbox.checked ? requestBody = {status: CourseStatuses.OpenForAssigning} :
          startedCheckbox.checked ? requestBody = {status: CourseStatuses.Started} :
              finishedCheckbox.checked ? requestBody = {status: CourseStatuses.Finished} :
                  {};

      const response = await changeCourseStatusQuery(requestBody);
      if (response.ok) {
            togglePopup();
            toggleSuccessPopup();

            const statusTranslationMap = new Map<number, string>();
            statusTranslationMap.set(0, "Создан");
            statusTranslationMap.set(1, "Открыт для записи");
            statusTranslationMap.set(2, "В процессе обучения");
            statusTranslationMap.set(3, "Закончен");

            const statusPar = document.getElementById("status-par") as HTMLParagraphElement;
            // @ts-ignore
            statusPar.textContent = statusTranslationMap.get(requestBody.status);
      }
      else {
            toggleFailurePopup();
      }
      throw response;
}

export { initPopupRedactStatus, popupRedactStatus}