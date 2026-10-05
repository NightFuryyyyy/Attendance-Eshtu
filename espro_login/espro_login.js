const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

observer = new MutationObserver(mutations => {
    addFillButton()
});

const fillButton = document.createElement("div");
fillButton.id = "fillButton";
fillButton.appendChild(document.createTextNode("Fill"));

function addFillButton(regNo, password) {
    const signInButton = document.getElementById("kc-login");
    const usernameTextbox = document.getElementById("username");
    const passwordTextbox = document.getElementById("password");
    if (!document.getElementById("fillButton")) {
        fillButton.addEventListener("click", () => {
            usernameTextbox.value = regNo;
            passwordTextbox.value = password;
        });
        signInButton.before(fillButton);
    }
    observer.disconnect();
}

async function main() {
    const { regNo, password } = await browserAPI.storage.local.get(["regNo", "password"]);
    if (!regNo || !password) {
        return;
    }
    addFillButton(regNo, password);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

main();