import "./lib/index.css"
import "./options.css"
import PACKAGE_JSON from "../package.json"
import MANIFEST_JSON from "../manifest.json"
import { Environment } from "./model/Environment"
import { getDisplaySettings, getEnvironments, saveDisplaySettings, saveEnvironments } from "./storage/storage"
import { sleep } from "./helper/sleep"
import { EnvironmentTypeEnum } from "./model/EnvironmentTypeEnum"
import { OptionsFooter } from "./lib/options-footer"
import { OptionsHeader } from "./lib/options-header"
import { ALL_HOSTS_WILDCARD } from "./config/config"
import { TextPositionEnum } from "./model/TextPositionEnum"
import { DisplaySettings } from "./model/DisplaySettings"

const redEnvironments = document.querySelector("#red-environments") as HTMLTextAreaElement
const yellowEnvironments = document.querySelector("#yellow-environments") as HTMLTextAreaElement
const greenEnvironments = document.querySelector("#green-environments") as HTMLTextAreaElement
const saveSection = document.querySelector(".save-section") as HTMLDivElement
const container = document.querySelector(".options") as HTMLDivElement

const displayOpacity = document.querySelector("#display-opacity") as HTMLInputElement
const textPositionRight = document.querySelector("#text-position-right") as HTMLInputElement
const textPositionCenter = document.querySelector("#text-position-center") as HTMLInputElement
const textPositionLeft = document.querySelector("#text-position-left") as HTMLInputElement
const textPositionNone = document.querySelector("#text-position-none") as HTMLInputElement

const saveButton = document.querySelector("#save-button") as HTMLButtonElement

function linesToArray(value?: string): string[] {
    return value?.split("\n").filter((v) => v.trim() !== "") || []
}

saveButton.addEventListener("click", () => {
    // Promises break the permission asking flow!
    chrome.permissions.request({
        permissions: ["scripting"],
        origins: [ALL_HOSTS_WILDCARD],
    })

    saveButton.disabled = true

    const redPatterns = linesToArray(redEnvironments.value)
    const yellowPatterns = linesToArray(yellowEnvironments.value)
    const greenPatterns = linesToArray(greenEnvironments.value)

    const environments: Environment[] = [
        ...redPatterns.map((pattern) =>
            Environment.fromObject({
                pattern,
                type: EnvironmentTypeEnum.Red,
            })
        ),
        ...yellowPatterns.map((pattern) =>
            Environment.fromObject({
                pattern,
                type: EnvironmentTypeEnum.Yellow,
            })
        ),
        ...greenPatterns.map((pattern) =>
            Environment.fromObject({
                pattern,
                type: EnvironmentTypeEnum.Green,
            })
        ),
    ]

    let textPositionValue = TextPositionEnum.None

    if (textPositionRight.checked) {
        textPositionValue = TextPositionEnum.Right
    } else if (textPositionLeft.checked) {
        textPositionValue = TextPositionEnum.Left
    } else if (textPositionCenter.checked) {
        textPositionValue = TextPositionEnum.Center
    }

    const displaySettings = new DisplaySettings(textPositionValue, Number.parseInt(displayOpacity.value))

    ;(async () => {
        await saveEnvironments(environments)
        await saveDisplaySettings(displaySettings)
        await sleep(300)

        saveButton.disabled = false
    })()
})
;(async () => {
    const [environments, displaySettings] = await Promise.all([getEnvironments(), getDisplaySettings()])

    const redPatterns = []
    const yellowPatterns = []
    const greenPatterns = []

    for (const environment of environments) {
        if (environment.type === EnvironmentTypeEnum.Red) {
            redPatterns.push(environment.pattern)
        } else if (environment.type === EnvironmentTypeEnum.Yellow) {
            yellowPatterns.push(environment.pattern)
        } else if (environment.type === EnvironmentTypeEnum.Green) {
            greenPatterns.push(environment.pattern)
        }
    }

    redEnvironments.value = redPatterns.join("\n")
    yellowEnvironments.value = yellowPatterns.join("\n")
    greenEnvironments.value = greenPatterns.join("\n")

    displayOpacity.value = Math.max(Math.min(displaySettings.opacity, 100), 0).toString()

    if (displaySettings.textPosition === TextPositionEnum.Left) {
        textPositionLeft.checked = true
    } else if (displaySettings.textPosition === TextPositionEnum.Right) {
        textPositionRight.checked = true
    } else if (displaySettings.textPosition === TextPositionEnum.Center) {
        textPositionCenter.checked = true
    } else {
        textPositionNone.checked = true
    }

    container.prepend(new OptionsHeader(MANIFEST_JSON.name, "Configure URL patterns", "/icon128.png"))

    saveSection.append(
        new OptionsFooter(
            PACKAGE_JSON.version,
            PACKAGE_JSON.author.name,
            PACKAGE_JSON.author.url,
            PACKAGE_JSON.homepage,
            PACKAGE_JSON.funding.url
        )
    )
})()
