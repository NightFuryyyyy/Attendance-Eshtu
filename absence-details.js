const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

async function saveAbsence() {
    const elements = document.querySelectorAll("body table.table.table-striped.table-bordered.table-condensed:nth-child(3) td b:nth-child(2)");
    if (elements.length <= 0) {
        return;
    }
    const absenceBeforeClaims = parseFloat(elements[0].textContent);
    const claims = parseFloat(elements[1].textContent);
    if (!absenceBeforeClaims || !claims) {
        return;
    }
    const absenceAfterClaims = absenceBeforeClaims - claims;
    try {
        await browserAPI.storage.local.set({
            absenceBeforeClaims,
            absenceAfterClaims,
        });
        for (i = 0; i < 2; i++) {
            Object.assign(elements[i].style, {
                backgroundColor: "#003399",
                color: "rgb(240, 240, 240)",
                padding: "3px",
                borderRadius: "5px"
            });
        }
        observer.disconnect();
    } catch (error) {
        console.error("Failed to save:", error);
    }
}

const observer = new MutationObserver((mutations) => {
    saveAbsence();
});

saveAbsence();

observer.observe(document.body, {
    childList: true,
    subtree: true
});