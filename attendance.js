const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

async function doStuff() {
    const trs = document.querySelectorAll("body table.table.table-striped.table-bordered.table-condensed tr");
    var element = null;
    for(i = 0; i < trs.length; i++) {
        const tr = trs[i];
        const td = tr.querySelector("td");
        if (!td) {
            continue;
        }
        if (td.textContent.includes("Total")) {
            element = tr.querySelector("tr>td:nth-child(2)>div");
            break;
        }
    };
    if (!element) {
        return;
    }
    const conducted = parseFloat(element.textContent);
    if (!conducted) {
        return;
    }
    element.style.background = "green";
    element.style.color = "white";
    var attendanceDisplayed = document.getElementById("attendanceDisplayed");
    if (!attendanceDisplayed) {
        attendanceDisplayed = document.createElement("tr");
        attendanceDisplayed.id = "attendanceDisplayed";
        attendanceDisplayed.style.fontSize = "14px";
        attendanceDisplayed.style.fontFamily = "monospace";
        attendanceDisplayed.style.whiteSpace = "pre";
        document.querySelector("table tr:nth-child(3)").after(attendanceDisplayed);
    }
    try {
        const fetchedValues = await browserAPI.storage.local.get(["absenceBeforeClaims", "absenceAfterClaims"]);
        const absenceBeforeClaims = fetchedValues["absenceBeforeClaims"];
        const absenceAfterClaims = fetchedValues["absenceAfterClaims"];
        if (!absenceBeforeClaims || !absenceAfterClaims) {
            throw new Error("Value missing");
        }
        var attendanceBeforeClaims = (conducted - absenceBeforeClaims) * 100 / conducted;
        attendanceBeforeClaims = Math.round(attendanceBeforeClaims * 100) / 100;
        var attendanceAfterClaims = (conducted - absenceAfterClaims) * 100 / conducted;
        attendanceAfterClaims = Math.round(attendanceAfterClaims * 100) / 100;
        if (attendanceDisplayed.classList.contains("attendance")) {
            return;
        }
        attendanceDisplayed.innerHTML = "";
        attendanceDisplayed.insertCell();
        const attendanceDisplayTd = attendanceDisplayed.insertCell();
        attendanceDisplayTd.appendChild(document.createTextNode(
            `Attendance before claims: ${attendanceBeforeClaims}%\nAttendance after claims:  ${attendanceAfterClaims}%`
        ));
        attendanceDisplayed.classList.add("attendance");
        attendanceDisplayed.classList.remove("fetch-fail");
        observer.disconnect();
    } catch(error) {
        console.error("Attendance Eshtu? failed to fetch values:", error);
        if (attendanceDisplayed.classList.contains("fetch-fail")) {
            return;
        }
        attendanceDisplayed.innerHTML = "";
        attendanceDisplayed.insertCell();
        const attendanceDisplayTd = attendanceDisplayed.insertCell();
        attendanceDisplayTd.appendChild(document.createTextNode("Attendance Eshtu? failed to fetch values"));
        attendanceDisplayed.classList.add("fetch-fail");
        attendanceDisplayed.classList.remove("attendance");
    }
}

var observer = new MutationObserver((mutations) => {
    doStuff();
});

doStuff();

observer.observe(document.body, {
    childList: true,
    subtree: true
});