const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class Main {
    static usernameTextbox = null;
    static passwordTextbox = null;
    static buttonRow = null;
    static buttonRowCells = null;
    static forgotPasswordCell = null;
    static loginButton = null;
    static captchaImageDiv = null;
    static captchaImg = null;
    static captchaRefresh = null;
    static captchaBox = null;

    static fillButtonCell = document.createElement("td");
    static fillButton = document.createElement("input");
    static gravityCanvas = document.createElement("canvas");
    static gravityCtx = null;
    
    static divisions = [0.00, 0.21, 0.35, 0.50, 0.65, 0.79, 1.00];

    static showFillButton = null;
    static regNo = null;
    static password = null;
    static solveCaptcha = null;

    static fillButtonAdded = false;
    static gravityCanvasAdded = false;
    static captchaLoadListenerAdded = false;

    static initialise() {
        this.fillButtonCell.appendChild(this.fillButton);
        this.fillButton.id = "fillButton";
        this.fillButton.type = "button";
        this.fillButton.classList.add("btn");
        this.fillButton.value = "Fill";

        this.gravityCanvas.id = "gravityCaptcha";
        this.gravityCtx = this.gravityCanvas.getContext("2d");
    }

    static assignElementsToVariables() {
        if (!this.captchaBox) {
            this.usernameTextbox = document.getElementById("username");
            this.passwordTextbox = document.getElementById("password");
            this.buttonRow = document.querySelector("tr:has(#Login)");
            this.buttonRowCells = this.buttonRow.querySelectorAll("td");
            this.forgotPasswordCell = this.buttonRow.querySelector(".forgetpassword");
            this.loginButton = document.getElementById("Login");
            this.captchaImageDiv = document.getElementById("captchaImageDiv");
            this.captchaImg = document.getElementById("captcha_img");
            this.captchaRefresh = document.getElementById("captchaRefresh");
            this.captchaBox = document.getElementById("captchaBox");
        }
    }

    static async getLocalValues() {
        const fetchedValues = await browserAPI.storage.local.get(["showFillButton", "regNo", "password", "solveCaptcha"]);
        this.showFillButton = fetchedValues.showFillButton ?? false;
        this.regNo = fetchedValues.regNo;
        this.password = fetchedValues.password;
        this.solveCaptcha = fetchedValues.solveCaptcha ?? false;
    }

    static addFillButton() {
        this.buttonRowCells.forEach(cell => {
            cell.removeAttribute("align");
            cell.removeAttribute("width");
        });

        this.fillButton.addEventListener("click", event => {
            if (!this.captchaLoadListenerAdded) {
                this.captchaImg.addEventListener("load", async () => {
                    Object.assign(this.gravityCanvas, {
                        width: this.captchaImg.width * 2,
                        height: this.captchaImg.height * 2 * 0.625,
                    });
                    this.gravityCtx.imageSmoothingEnabled = false;
                    this.gravityCtx.fillStyle = "#ffffff";
                    this.gravityCtx.fillRect(0, 0, this.gravityCanvas.width, this.gravityCanvas.height);

                    for (let i = 1; i < this.divisions.length; i++) {
                        const divisionCanvas = document.createElement("canvas");
                        Object.assign(divisionCanvas, {
                            width: this.captchaImg.width * (this.divisions[i] - this.divisions[i - 1]) * 2,
                            height: this.captchaImg.height * 2,
                        });
                        const divisionCtx = divisionCanvas.getContext("2d", {
                            willReadFrequently: true,
                        });
                        divisionCtx.imageSmoothingEnabled = false;
                        divisionCtx.drawImage(
                            this.captchaImg,
                            this.captchaImg.width * this.divisions[i - 1],
                            0,
                            this.captchaImg.width * (this.divisions[i] - this.divisions[i - 1]),
                            this.captchaImg.height,
                            0, 0,
                            divisionCanvas.width,
                            divisionCanvas.height
                        );

                        var copyY = this.gravityCanvas.height - 5;
                        for (let j = divisionCanvas.height - 1; j >= 0; j--) {
                            var nonWhiteFound = false;
                            for (let k = 0; k < divisionCanvas.width; k++) {
                                const pixel = divisionCtx.getImageData(k, j, 1, 1).data;
                                if (pixel[0] == 255 && pixel[1] == 255 && pixel[2] == 255) {
                                    this.gravityCtx.fillStyle = "#ffffff";
                                    this.gravityCtx.fillRect((this.divisions[i - 1] * this.gravityCanvas.width) + k, copyY, 1, 1);
                                } else {
                                    nonWhiteFound = true;
                                    this.gravityCtx.fillStyle = "#000000";
                                    this.gravityCtx.fillRect((this.divisions[i - 1] * this.gravityCanvas.width) + k, copyY, 1, 1);
                                }
                            }
                            if (nonWhiteFound) {
                                copyY--;
                            }
                        }
                    }

                    const worker = await Tesseract.createWorker('eng');
                    worker.setParameters({
                        tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyz0123456789",
                    });
                    const ret = await worker.recognize(this.gravityCanvas.toDataURL());
                    const result = ret.data.text.trim();
                    await worker.terminate();
                    if (result.length != 6) {
                        this.captchaRefresh.click();
                    }
                    this.captchaBox.value = result;
                });
                this.captchaLoadListenerAdded = true;
            }
            if (this.regNo) {
                this.usernameTextbox.value = this.regNo;
            }
            if (this.password) {
                this.passwordTextbox.value = this.password;
            }
            if (this.solveCaptcha) {
                this.captchaRefresh.click();
            }
        });
        this.forgotPasswordCell.after(this.fillButtonCell);
    }

    static doStuff() {
        this.assignElementsToVariables();

        if (this.showFillButton && (this.regNo || this.password || this.solveCaptcha) && !this.fillButtonAdded) {
            this.addFillButton();
            this.fillButtonAdded = true;
        }
        if (this.solveCaptcha && !this.gravityCanvasAdded) {
            this.captchaImageDiv.appendChild(this.gravityCanvas);
            this.gravityCanvasAdded = true;
        }

        this.observer.disconnect();
    }

    static observer = new MutationObserver((mutations) => {
        this.doStuff();
    });

    static async main() {
        this.initialise();
        await this.getLocalValues();

        this.doStuff();

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

Main.main();