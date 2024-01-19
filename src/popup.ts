import "./popup.css"
import { enableExtension, isExtensionEnabled } from "./storage/storage"
import { sleep } from "./helper/sleep"
;(async function () {
    const versionLabel = document.querySelector("#version") as HTMLDivElement

    versionLabel.textContent = `Version ${PACKAGE_VERSION}`
    const button = document.querySelector("#enable-button") as HTMLButtonElement

    let isEnabled = await isExtensionEnabled()

    if (isEnabled) {
        button.textContent = "Disable"
    } else {
        button.textContent = "Enable"
    }

    button.addEventListener("click", async () => {
        button.disabled = true
        await enableExtension(!isEnabled)

        isEnabled = !isEnabled

        if (isEnabled) {
            button.textContent = "Disable"
        } else {
            button.textContent = "Enable"
        }

        await sleep(300)

        button.disabled = false
    })
})()
