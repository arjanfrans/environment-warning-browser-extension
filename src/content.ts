import { Environment } from "./model/Environment"
import { getDisplaySettings, getEnvironments } from "./storage/storage"
import { getModifiedFavicon } from "./favicon/favicon"
import { BANNER_ELEMENT_ID, FAVICON_ATTRIBUTE } from "./config/config"
import { EnvironmentTypeEnum } from "./model/EnvironmentTypeEnum"
import { TextPositionEnum } from "./model/TextPositionEnum"
import { DisplaySettings } from "./model/DisplaySettings"

let displaySettings: DisplaySettings | undefined = undefined
let environments: Environment[] = []

chrome.storage.onChanged.addListener((changes, namespace) => {
    let environmentsChanged = true
    let displaySettingsChanged = true

    if (!changes.environments || changes.environments.newValue === undefined || namespace !== "sync") {
        environmentsChanged = false
    }

    if (!changes.displaySettings || changes.displaySettings.newValue === undefined || namespace !== "sync") {
        displaySettingsChanged = false
    }

    if (displaySettingsChanged) {
        displaySettings = DisplaySettings.fromObject(changes.displaySettings.newValue)
    }

    if (environmentsChanged) {
        environments = changes.environments.newValue.map(Environment.fromObject)
    }

    for (const environment of environments) {
        if (environment.matches(window.location.href)) {
            renderWarningBanner(environment.type, displaySettings?.textPosition, displaySettings?.opacity)

            return
        }
    }
})

async function updateFavicon(type: string) {
    const link = document.querySelector("link[rel='icon'], link[rel='shortcut icon']") as HTMLLinkElement | undefined

    if (!link) {
        return
    }

    if (!link.hasAttribute(FAVICON_ATTRIBUTE)) {
        let color: string

        if (type === "red") {
            color = "rgba(255,0,0)"
        } else if (type === "yellow") {
            color = "rgba(255,255,0)"
        } else {
            color = "rgba(0,255,0)"
        }

        link.setAttribute(FAVICON_ATTRIBUTE, "true")

        link.type = "image/png"
        link.href = await getModifiedFavicon(link.href, color)
    }
}

function getWarningBanner(): HTMLDivElement {
    let banner = document.querySelector(`#${BANNER_ELEMENT_ID}`) as HTMLDivElement | undefined

    if (!banner) {
        banner = document.createElement("div")
        banner.id = BANNER_ELEMENT_ID
        banner.style.height = "30px"
        banner.style.fontWeight = "bold"
        banner.style.width = "100%"
        banner.style.position = "fixed"
        banner.style.color = "#000000"
        banner.style.top = "0"
        banner.style.left = "0"
        banner.style.zIndex = "99999"
        banner.style.pointerEvents = "none"
        banner.style.fontFamily = "monospace"
        banner.style.fontSize = "18px"
        banner.style.display = "flex"
        banner.style.borderRadius = "0"
        banner.style.flexDirection = "column"
        banner.style.margin = "0"
        banner.style.paddingBlock = "0"
        banner.style.justifyContent = "center"
        banner.style.paddingInline = "12px"

        document.body.append(banner)
    }

    return banner
}

function renderWarningBanner(
    type: EnvironmentTypeEnum,
    textPosition: TextPositionEnum = TextPositionEnum.Center,
    opacity: number = 50
) {
    const banner = getWarningBanner()

    banner.textContent = `${type.toUpperCase()} ENVIRONMENT`

    if (type === EnvironmentTypeEnum.Red) {
        banner.style.backgroundColor = "rgb(255,0,0)"
    } else if (type === EnvironmentTypeEnum.Yellow) {
        banner.style.backgroundColor = "rgb(255,255,0)"
    } else if (type === EnvironmentTypeEnum.Green) {
        banner.style.backgroundColor = "rgb(0,255,0)"
    }

    banner.style.opacity = `${opacity / 100}`
    banner.style.textAlign = textPosition
}

(async function () {
    environments = await getEnvironments()
    displaySettings = await getDisplaySettings()

    for (const environment of environments) {
        if (environment.matches(window.location.href)) {
            renderWarningBanner(environment.type, displaySettings.textPosition, displaySettings.opacity)

            await updateFavicon(environment.type)

            return
        }
    }
})()
