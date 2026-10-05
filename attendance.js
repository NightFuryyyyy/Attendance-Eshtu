const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.querySelector("button.MuiToggleButtonGroup-grouped:nth-child(2)").classList.add("click-me");

const observer = new MutationObserver((mutations) => {
    main();
});

function createWithCocurricularPill() {
    const withCocurricularPill = document.createElement("span");
    withCocurricularPill.textContent = "With Co-curricular";
    withCocurricularPill.style.cssText = "font-size: 0.65rem; color: rgb(245, 158, 11); font-weight: 700; background-color: rgba(245, 158, 11, 0.125); padding: 3.5px 8px; border-radius: 16px;";
    return withCocurricularPill;
}

async function main() {
    observer.disconnect();

    const first_cell = document.querySelector("tr.css-1i3xmw4:nth-child(1) > th:nth-child(1)");

    if (!first_cell || document.getElementById("extraPercentageHeader")) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        return;
    }
    const isCocurricular = !!first_cell.querySelector("div:nth-child(4) > span:nth-child(1)");

    const percentage_header = document.querySelector("th.MuiTableCell-root:nth-child(5)");
    const new_percentage_header = percentage_header.cloneNode();
    new_percentage_header.id = "extraPercentageHeader";

    percentage_header.textContent = "Percentage (without claims)";
    new_percentage_header.textContent = "Percentage (with claims)";
    percentage_header.after(new_percentage_header);

    let overall_conducted, overall_presence, overall_claims;
    overall_conducted = overall_presence = overall_claims = 0;

    const rows = document.querySelectorAll("tr.css-1i3xmw4");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const percentage_cell = cells[3];
        const new_percentage_cell = percentage_cell.cloneNode();
        if (percentage_cell.textContent.trim() == "-") {
            new_percentage_cell.textContent = "-";
            percentage_cell.after(new_percentage_cell);
            return;
        }
        let [ presence, conducted ] = cells[0].textContent.split("/").map(val => parseInt(val));
        const claims = parseInt(cells[2].textContent);
        if (isCocurricular) {
            presence -= claims;
            const attendanceWithoutClaims = Math.round((presence / conducted) * 10000) / 100;
            new_percentage_cell.textContent = `${attendanceWithoutClaims}%`;
            percentage_cell.before(new_percentage_cell);
        } else {
            const attendanceWithClaims = Math.round(((presence + claims) / conducted) * 10000) / 100;
            new_percentage_cell.textContent = `${attendanceWithClaims}%`;
            percentage_cell.after(new_percentage_cell);
        }
        overall_conducted += conducted;
        overall_presence += presence;
        overall_claims += claims;
    });

    if (document.getElementById("newMobileOverallAttDiv")) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        return;
    }

    const overallAttendanceWidget = document.querySelector("div.MuiGrid-grid-sm-6:nth-child(1)");
    const newOverallAttendanceWidget = overallAttendanceWidget.cloneNode(true);
    const newOverallAttWidgetInternalDiv = newOverallAttendanceWidget.querySelector("div.MuiCardContent-root");
    const newOverallPercH4 = newOverallAttendanceWidget.querySelector("h4.MuiTypography-root");
    const newOverallFractionPara = newOverallAttendanceWidget.querySelector("p.MuiTypography-body2");
    const newProgressFill = newOverallAttendanceWidget.querySelector("span.MuiLinearProgress-bar");
    newProgressFill.style.backgroundColor = "rgb(142, 184, 255)";
    
    const overallAttendanceWithoutClaims = Math.round((overall_presence / overall_conducted) * 10000) / 100;
    const overallAttendanceWithClaims = Math.round(((overall_presence + overall_claims) / overall_conducted) * 10000) / 100;

    await browserAPI.storage.local.set({
        attendanceBeforeClaims: overallAttendanceWithoutClaims,
        attendanceAfterClaims: overallAttendanceWithClaims,
        lastUpdated: new Date().toISOString(),
    });

    if (isCocurricular) {
        newOverallAttendanceWidget.querySelector("div.MuiBox-root")?.remove();
        newOverallPercH4.textContent = `${overallAttendanceWithoutClaims}%`;
        newOverallFractionPara.textContent = `${overall_presence} / ${overall_conducted} hrs`;
        newProgressFill.style.transform = `translateX(${overallAttendanceWithoutClaims - 100}%)`;
        overallAttendanceWidget.before(newOverallAttendanceWidget);
    } else {
        const withCocurricularPill = createWithCocurricularPill();
        Object.assign(withCocurricularPill.style, {
            marginLeft: "auto",
            display: "flex",
            width: "fit-content",
        });
        newOverallAttWidgetInternalDiv.prepend(withCocurricularPill);
        newOverallPercH4.textContent = `${overallAttendanceWithClaims}%`;
        newOverallFractionPara.textContent = `${overall_presence + overall_claims} / ${overall_conducted} hrs`;
        newProgressFill.style.transform = `translateX(${overallAttendanceWithClaims - 100}%)`;
        overallAttendanceWidget.after(newOverallAttendanceWidget);
    }

    const mobileOverallAttendanceWidget = document.querySelector(".css-1ohlybh");
    const headerAndPerc = mobileOverallAttendanceWidget.querySelector("div.MuiBox-root.css-6fjwu3");
    const mobileOverallAttHeader = headerAndPerc.querySelector("p.MuiTypography-root");
    const progressBar = mobileOverallAttendanceWidget.querySelector("span.MuiLinearProgress-root");
    const mobileOverallFractDiv = mobileOverallAttendanceWidget.querySelector("div.css-1w71xjo");

    const newMobileOverallAttDiv = document.createElement("div");
    newMobileOverallAttDiv.id = "newMobileOverallAttDiv";
    newMobileOverallAttDiv.style.marginBottom = "10px";
    const newHeaderAndPerc = newMobileOverallAttDiv.appendChild(headerAndPerc.cloneNode(true));
    const newProgressBar = newMobileOverallAttDiv.appendChild(progressBar.cloneNode(true));
    const newMobileOverallFractDiv = newMobileOverallAttDiv.appendChild(mobileOverallFractDiv.cloneNode(true));
    
    const newMobileOverallAttHeader = newHeaderAndPerc.querySelector("p.MuiTypography-root");
    const newMobileOverallPerc = newHeaderAndPerc.querySelector("h6.MuiTypography-root");
    const newMobileProgressFill = newProgressBar.querySelector("span.MuiLinearProgress-bar");
    const newOverallFractPara = newMobileOverallFractDiv.querySelector("p.MuiTypography-root");

    newMobileProgressFill.style.backgroundColor = "rgb(142, 184, 255)";
    
    if (isCocurricular) {
        mobileOverallAttHeader.appendChild(createWithCocurricularPill()).style.marginLeft = "10px";
        newMobileOverallPerc.textContent = `${overallAttendanceWithoutClaims}%`;
        newMobileProgressFill.style.transform = `translateX(${overallAttendanceWithoutClaims - 100}%)`;
        newOverallFractPara.textContent = `${overall_presence} / ${overall_conducted} hrs attended`;
        headerAndPerc.before(newMobileOverallAttDiv);
    } else {
        newMobileOverallAttHeader.appendChild(createWithCocurricularPill()).style.marginLeft = "10px";;
        newMobileOverallPerc.textContent = `${overallAttendanceWithClaims}%`;
        newMobileProgressFill.style.transform = `translateX(${overallAttendanceWithClaims - 100}%)`;
        newOverallFractPara.textContent = `${overall_presence + overall_claims} / ${overall_conducted} hrs attended`;
        mobileOverallFractDiv.after(newMobileOverallAttDiv);
    }

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

observer.observe(document.body, {
    childList: true,
    subtree: true
});
main();

const style = document.createElement("style");
style.textContent = `
    .click-me[aria-pressed="false"]  {
    animation: pulse-rotate 1.5s ease infinite;
    }

    @keyframes pulse-rotate {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
        background-color: rgb(244, 63, 94);
    }
    100% {
        transform: scale(1);
    }
    }
`;
document.head.appendChild(style);