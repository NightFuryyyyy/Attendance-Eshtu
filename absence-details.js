const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

async function saveAbsence() {
    const elements = document.querySelectorAll("body table.table.table-striped.table-bordered.table-condensed:nth-child(3) td b:nth-child(2)");
    if (elements.length <= 0) {
        return;
    }
    const absenceBeforeClaims = parseFloat(elements[0].textContent);
    const absenceAfterClaims = parseFloat(elements[2].textContent);
    if (!absenceBeforeClaims || !absenceAfterClaims) {
        return;
    }
    try {
        await browserAPI.storage.local.set({
            absenceBeforeClaims,
            absenceAfterClaims
        });
        for (i = 1; i < 3; i++) {
            elements[i].style.background = "green";
            elements[i].style.color = "white";
        }
    } catch (error) {
        console.error("Failed to save:", error);
    }
}

const observer = new MutationObserver((mutations) => {
    saveAbsence();
    observer.disconnect();
});

saveAbsence();

observer.observe(document.body, {
    childList: true,
    subtree: true
});