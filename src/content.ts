import { Environment } from "./Environment"
import { getEnvironments } from "./Storage"
import { getModifiedFavicon } from "./ImageOverlay"

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (!changes.environments || changes.environments.newValue === undefined || namespace !== "sync") {
        return
    }

    const environments: Environment[] = changes.environments.newValue.map(Environment.fromObject)

    for (const environment of environments) {
        if (environment.matches(window.location.href)) {
            renderWarningBanner(environment.type)

            return
        }
    }
})

async function updateFavicon(type: string) {
    const link = document.querySelector("link[rel*='icon'], link[rel*='shortcut icon']") as HTMLLinkElement | undefined

    if (!link) {
        return
    }

    if (!link.hasAttribute("injected-favicon")) {
        let color: string

        if (type === "red") {
            color = "rgba(255,0,0)"
        } else if (type === "yellow") {
            color = "rgba(255,255,0)"
        } else {
            color = "rgba(0,255,0)"
        }

        link.setAttribute("injected-favicon", "true")

        link.type = "image/png"
        link.href = await getModifiedFavicon(link.href, color)
    }
}

function renderWarningBanner(type: string) {
    let banner = document.querySelector("#__warning-banner") as HTMLDivElement | undefined

    if (!banner) {
        banner = document.createElement("div")
    }

    banner.textContent = `${type.toUpperCase()} SYSTEM`

    banner.id = "__warning-banner"

    if (type === "red") {
        banner.style.backgroundColor = "rgb(255,0,0)"
    } else if (type === "yellow") {
        banner.style.backgroundColor = "rgb(255,255,0)"
    } else if (type === "green") {
        banner.style.backgroundColor = "rgb(0,255,0)"
    }

    banner.style.textAlign = "center"
    banner.style.height = "30px"
    banner.style.fontWeight = "bold"
    banner.style.width = "100%"
    banner.style.opacity = "0.5"
    banner.style.position = "fixed"
    banner.style.color = "#000000"
    banner.style.top = "0"
    banner.style.left = "0"
    banner.style.zIndex = "99999"
    banner.style.pointerEvents = "none"
    banner.style.fontFamily = "monospace"
    banner.style.fontSize = "18px"
    banner.style.display = "flex"
    banner.style.flexDirection = "column"
    banner.style.justifyContent = "center"

    document.body.append(banner)
}

(async function () {
    const environments: Environment[] = await getEnvironments()

    for (const environment of environments) {
        if (environment.matches(window.location.href)) {
            renderWarningBanner(environment.type)

            await updateFavicon(environment.type)

            return
        }
    }
})()
