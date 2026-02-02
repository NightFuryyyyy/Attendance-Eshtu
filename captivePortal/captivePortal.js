const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class captivePortal {
    static observer = new MutationObserver(mutations => {
        this.doStuff()
    });

    static buttonrow;
    static loginbutton;

    static showFillButton;
    static regNo;
    static password;

    static fillButton = document.createElement("div");

    static fillButtonAdded = false;

    static {
        this.fillButton.id = "fillButton";
        this.fillButton.appendChild(document.createTextNode("Fill"));
    }

    static async getLocalValues() {
        const fetchedValues = await browserAPI.storage.local.get(["showFillButton", "regNo", "password"]);
        this.showFillButton = fetchedValues.showFillButton ?? false;
        this.regNo = fetchedValues.regNo;
        this.password = fetchedValues.password;
    }

    static doStuff() {
        console.log("doStuff called");
        this.buttonrow ??= document.querySelector(".buttonrow:has(#loginbutton)");
        this.loginbutton ??= document.getElementById("loginbutton");
        this.usernameTextbox ??= document.getElementById("username");
        this.passwordTextbox ??= document.getElementById("password");
        if (!this.buttonrow) {
            return;
        }
        if (!this.fillButtonAdded) {
            this.fillButton.addEventListener("click", () => {
                this.usernameTextbox.value = this.regNo;
                this.passwordTextbox.value = this.password;
            });
            this.buttonrow.prepend(this.fillButton);
            this.fillButtonAdded = true;
        }
        this.observer.disconnect();
    }

    static async main() {
        await this.getLocalValues();
        if (!this.showFillButton || !this.regNo || !this.password) {
            return;
        }
        this.doStuff();

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

captivePortal.main();