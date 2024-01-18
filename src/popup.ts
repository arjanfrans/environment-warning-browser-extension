import { enableExtension, isExtensionEnabled } from "./Storage"

;(async function () {
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

        button.disabled = false
    })
})()
