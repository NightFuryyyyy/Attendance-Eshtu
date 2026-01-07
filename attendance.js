const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class Main {
    static observer = new MutationObserver((mutations) => {
        this.doStuff();
    });
    static includesClaims = null;
    
    static table = null;
    static existingTotalTr = null;
    static existingTotalDescTd = null;
    static totalConductedDiv = null;
    static extraTr = null;
    static AYTitle = document.createElement("span");
    static absencePageA = document.createElement("a");
    
    static ABSENCE_PAGE_URL = "https://kp.christuniversity.in/KnowledgePro/studentWiseAttendanceSummary.do?method=getStudentAbscentWithCocularLeave";
    
    static existingTotal = null;
    static totalConducted = null;
    static fetchedValues = null;
    static absenceBeforeClaims = null;
    static absenceAfterClaims = null;
    static lastUpdated = null;

    static TITLE = "Attendance Eshtu?";

    static extraTrState = null;
    static ATTENDANCE_SHOWN = 0;
    static FETCH_FAIL = 1;
    static OUTDATED_VALUES = 2;

    static MessageTR(message) {
        const messageTr = document.createElement("tr");
        const messageTd = messageTr.insertCell();

        messageTd.appendChild(this.AYTitle);
        messageTd.appendChild(document.createTextNode(` ${message} Go `));
        messageTd.appendChild(this.absencePageA);
        messageTd.appendChild(document.createTextNode(" to update absence values."));

        messageTd.colSpan = "3";
        messageTd.style.textAlign = "center";

        return messageTr;
    }

    static doStuff() {
        if (!this.extraTr) {
            this.table = document.querySelector("table table table");
            this.totalConductedDiv = this.table.querySelector("tr:has(td[colspan='2'])>td:last-child td:nth-child(2) div");
            this.existingTotalTr = this.table.querySelector("tr:has(td[colspan='2']):last-child");
            this.existingTotalDescTd = this.existingTotalTr.querySelector("td");
            this.extraTr = this.table.insertRow();
            
            this.totalConducted = parseFloat(this.totalConductedDiv.textContent);
            this.existingTotal = parseFloat(this.existingTotalTr.querySelector("td:nth-child(2)").textContent);
            this.includesClaims = this.existingTotalDescTd.textContent.includes("(With Co-curricular Leave)");
            const newTotalDesc = `Attendance Percentage with${this.includesClaims ? "" : "out"} Claims`;

            this.existingTotalDescTd.textContent = "";
            this.existingTotalDescTd.appendChild(document.createTextNode(newTotalDesc));
            Object.assign(this.existingTotalDescTd.style, {
                fontWeight: "700",
                textAlign: "right"
            });
        }

        if (!this.absenceBeforeClaims || !this.absenceAfterClaims || !this.lastUpdated) {
            if (this.extraTrState == this.FETCH_FAIL) {
                return;
            }
            
            const extraTrToInject = this.MessageTR("Failed to fetch values.");

            this.extraTr.replaceWith(extraTrToInject);
            this.extraTr = extraTrToInject;

            this.extraTrState = this.FETCH_FAIL;
            return;
        }

        var attendanceBeforeClaims = (this.totalConducted - this.absenceBeforeClaims) * 100 / this.totalConducted;
        attendanceBeforeClaims = Math.round(attendanceBeforeClaims * 100) / 100;
        var attendanceAfterClaims = (this.totalConducted - this.absenceAfterClaims) * 100 / this.totalConducted;
        attendanceAfterClaims = Math.round(attendanceAfterClaims * 100) / 100;

        if ((this.includesClaims && this.existingTotal != attendanceAfterClaims) || (!this.includesClaims && this.existingTotal != attendanceBeforeClaims)) {
            if (this.extraTrState == this.OUTDATED_VALUES) {
                return;
            }

            const extraTrToInject = this.MessageTR("Values are outdated.");

            this.extraTr.replaceWith(extraTrToInject);
            this.extraTr = extraTrToInject;

            this.extraTrState = this.OUTDATED_VALUES;
            return
        };

        if (this.extraTrState == this.ATTENDANCE_SHOWN) {
            return;
        }
        const extraTrToInject = document.createElement("tr");
        const totalDescTd = extraTrToInject.insertCell();
        const totalTd = extraTrToInject.insertCell();

        const totalDesc = `Attendance Percentage with${this.includesClaims ? "out" : ""} Claims`;
        const total = this.includesClaims ? attendanceBeforeClaims : attendanceAfterClaims;

        totalDescTd.appendChild(document.createTextNode(totalDesc));
        totalTd.appendChild(document.createTextNode(total));

        
        Object.assign(extraTrToInject.style, {
            fontWeight: "700",
            textAlign: "right"
        });
        totalDescTd.colSpan = "2";

        this.extraTr.replaceWith(extraTrToInject);
        this.extraTr = extraTrToInject;
        
        this.extraTrState = this.ATTENDANCE_SHOWN;

        Main.observer.disconnect();
    }

    static {
        this.AYTitle.appendChild(document.createTextNode(this.TITLE));
        Object.assign(this.AYTitle.style, {
            backgroundColor: "#003399",
            color: "rgb(240, 240, 240)",
            padding: "3px",
            borderRadius: "5px"
        });

        this.absencePageA.appendChild(document.createTextNode("here"));
        this.absencePageA.href = this.ABSENCE_PAGE_URL;
        this.absencePageA.style.textDecoration = "underline";
    }

    static async main() {
        try {
            this.fetchedValues = await browserAPI.storage.local.get(["absenceBeforeClaims", "absenceAfterClaims", "lastUpdated"]);
            this.absenceBeforeClaims = this.fetchedValues.absenceBeforeClaims;
            this.absenceAfterClaims = this.fetchedValues.absenceAfterClaims;
            this.lastUpdated = (new Date(this.fetchedValues.lastUpdated)).toLocaleDateString("en-IN", {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error(`${this.TITLE} failed to fetch values:`, error);
        }

        this.doStuff();

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

Main.main();