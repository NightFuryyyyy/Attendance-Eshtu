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
    const lastUpdated = (new Date()).toISOString();
    try {
        await browserAPI.storage.local.set({
            absenceBeforeClaims,
            absenceAfterClaims,
            lastUpdated
        });
        for (i = 0; i < 2; i++) {
            elements[i].style.background = "green";
            elements[i].style.color = "white";
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