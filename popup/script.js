const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const attendanceDiv = document.getElementById("attendanceDiv");
const attendanceWithoutClaims = document.getElementById("attendanceWithoutClaims");
const attendanceWithClaims = document.getElementById("attendanceWithClaims");
const lastUpdatedDate = document.getElementById("lastUpdatedDate");
const lastUpdatedTime = document.getElementById("lastUpdatedTime");
const autofillDiv = document.getElementById("autofillDiv");
const showFill = document.getElementById("showFill");
const regNoInput = document.getElementById("regNoInput");
const passwordInput = document.getElementById("passwordInput");
const saveLoginCredentials = document.getElementById("saveLoginCredentials");
const solveCaptchaCheckbox = document.getElementById("solveCaptchaCheckbox");

class MyDate {
    #date;
    #month;
    #year;
    #hours;
    #minutes;
    #seconds;
    #amPm;
    constructor(dateObj) {
        this.#date = dateObj.getDate();
        this.#month = dateObj.getMonth() + 1;
        this.#year = dateObj.getFullYear();
        this.#hours = dateObj.getHours();
        this.#amPm = this.#hours < 12 ? "am" : "pm";
        this.#hours = this.#hours % 12;
        this.#hours = this.#hours ? this.#hours : 12;
        this.#minutes = dateObj.getMinutes();
        this.#seconds = dateObj.getSeconds();
    }

    getDateString() {
        return [
            this.#date.toString().padStart(2, "0"),
            this.#month.toString().padStart(2, "0"),
            this.#year
        ].join("-");
    }

    getTimeString() {
        return [
            this.#hours.toString().padStart(2, "0"), ":",
            this.#minutes.toString().padStart(2, "0"), ":",
            this.#seconds.toString().padStart(2, "0"), " ",
            this.#amPm
        ].join("");
    }
}

showFill.checked = false;
async function fillExistingValues() {
    const fetchedValues = await browserAPI.storage.local.get([
        "attendanceBeforeClaims",
        "attendanceAfterClaims",
        "lastUpdated",
        "showFillButton",
        "regNo", "password",
        "solveCaptcha",
    ]);
    if (fetchedValues.lastUpdated) {
        attendanceWithoutClaims.appendChild(document.createTextNode(fetchedValues.attendanceBeforeClaims));
        attendanceWithClaims.appendChild(document.createTextNode(fetchedValues.attendanceAfterClaims));
        const lastUpdated = new MyDate(new Date(fetchedValues.lastUpdated));
        lastUpdatedDate.appendChild(document.createTextNode(lastUpdated.getDateString()));
        lastUpdatedTime.appendChild(document.createTextNode(lastUpdated.getTimeString()));
        attendanceDiv.classList.add("attendance");
    }
    showFill.checked = fetchedValues.showFillButton ?? false;
    regNoInput.value = fetchedValues.regNo ?? "";
    passwordInput.value = fetchedValues.password ?? "";
    solveCaptchaCheckbox.checked = fetchedValues.solveCaptcha ?? false;
}
fillExistingValues();

showFill.addEventListener("change", async event => {
    try {
        await browserAPI.storage.local.set({
            showFillButton: showFill.checked,
        });
    } catch (error) {
        console.error("Failed to save:", error);
    }
});

solveCaptchaCheckbox.addEventListener("change", async event => {
    try {
        await browserAPI.storage.local.set({
            solveCaptcha: solveCaptchaCheckbox.checked,
        });
    } catch (error) {
        console.error("Failed to save:", error);
    }
});

saveLoginCredentials.addEventListener("click", async event => {
    try {
        const regNo = regNoInput.value == "" ? null : regNoInput.value;
        const password = passwordInput.value == "" ? null : passwordInput.value;
        await browserAPI.storage.local.set({
            regNo,
            password,
        });
    } catch (error) {
        console.error("Failed to save:", error);
    }
});