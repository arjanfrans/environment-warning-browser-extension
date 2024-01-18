import "./options.css"
import { Environment } from "./Environment"
import { getEnvironments, saveEnvironments } from "./Storage"

const redEnvironments = document.querySelector("#red-environments") as HTMLTextAreaElement
const yellowEnvironments = document.querySelector("#yellow-environments") as HTMLTextAreaElement
const greenEnvironments = document.querySelector("#green-environments") as HTMLTextAreaElement

const saveButton = document.querySelector("#save-button") as HTMLButtonElement

;(async () => {
    const environments = await getEnvironments()

    const redPatterns = []
    const yellowPatterns = []
    const greenPatterns = []

    for (const environment of environments) {
        if (environment.type === "red") {
            redPatterns.push(environment.pattern)
        } else if (environment.type === "yellow") {
            yellowPatterns.push(environment.pattern)
        } else if (environment.type === "green") {
            greenPatterns.push(environment.pattern)
        }
    }

    redEnvironments.value = redPatterns.join("\n")
    yellowEnvironments.value = yellowPatterns.join("\n")
    greenEnvironments.value = greenPatterns.join("\n")
})()

saveButton.addEventListener("click", async () => {
    const redPatterns = redEnvironments.value?.split("\n") || []
    const yellowPatterns = yellowEnvironments.value?.split("\n") || []
    const greenPatterns = greenEnvironments.value?.split("\n") || []

    const environments = [
        ...redPatterns.map((pattern) =>
            Environment.fromObject({
                pattern,
                type: "red",
            })
        ),
        ...yellowPatterns.map((pattern) =>
            Environment.fromObject({
                pattern,
                type: "yellow",
            })
        ),
        ...greenPatterns.map((pattern) =>
            Environment.fromObject({
                pattern,
                type: "green",
            })
        ),
    ]

    await saveEnvironments(environments)

    await chrome.permissions.request({
        permissions: ["scripting"],
        origins: ["*://*/*"],
    })
})
