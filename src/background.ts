import { Environment } from "./model/Environment"
import { setIsExtensionEnabled, getEnvironments, isExtensionEnabled } from "./storage/storage"
import { ALL_HOSTS_WILDCARD } from "./config/config"
import TabChangeInfo = chrome.tabs.TabChangeInfo
import Tab = chrome.tabs.Tab
import { sleep } from "./helper/sleep"

const SCRIPT_ID = "content"
const SCRIPT_FILE = "content.js"
const ENABLE_DISABLE_CONTEXT_MENU_ITEM = "enable_disable_menu_item"
const OPTIONS_CONTEXT_MENU_ITEM = "options_menu_item"

const tabUpdateListener = async (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => {
    if (!tab.url) {
        return
    }

    if (changeInfo.status !== "complete") {
        return
    }

    await loadContentScripts(tabId, tab.url)
}

;(async function () {
    chrome.runtime.onInstalled.addListener(async () => {
        const isEnabled = await isExtensionEnabled()

        chrome.contextMenus.create({
            id: ENABLE_DISABLE_CONTEXT_MENU_ITEM,
            title: isEnabled ? "Disable" : "Enable",
            contexts: ["action"],
        })

        if (BUILD_TYPE === "firefox") {
            chrome.contextMenus.create({
                id: OPTIONS_CONTEXT_MENU_ITEM,
                title: "Options",
                contexts: ["action"],
            })
        }
    })

    chrome.contextMenus.onClicked.addListener(async (info) => {
        if (info.menuItemId === ENABLE_DISABLE_CONTEXT_MENU_ITEM) {
            const isEnabled = !(await isExtensionEnabled())

            await Promise.all([await setIsExtensionEnabled(isEnabled), sleep(300)])

            chrome.contextMenus.update(ENABLE_DISABLE_CONTEXT_MENU_ITEM, {
                title: isEnabled ? "Disable" : "Enable",
            })

            if (isEnabled) {
                await enableExtension()
            } else {
                await disableExtension()
            }

            return
        }

        if (info.menuItemId === OPTIONS_CONTEXT_MENU_ITEM) {
            chrome.runtime.openOptionsPage()
        }
    })

    chrome.storage.onChanged.addListener(async (changes, namespace) => {
        console.log(changes)
        if (!changes.enabled || namespace !== "local") {
            return
        }
        if (changes.enabled.newValue === false) {
            await disableExtension()
        } else if (changes.enabled.newValue === true) {
            await enableExtension()
        }
    })

    if (!(await isExtensionEnabled())) {
        return
    }

    await enableExtension()
})()

async function disableExtension() {
    if (chrome.tabs.onUpdated.hasListener(tabUpdateListener)) {
        chrome.tabs.onUpdated.removeListener(tabUpdateListener)
    }

    if (chrome.scripting) {
        if ((await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] })).length > 0) {
            await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] })
        }
    }

    chrome.contextMenus.update(ENABLE_DISABLE_CONTEXT_MENU_ITEM, {
        title: "Enable",
    })
}

async function enableExtension() {
    if (!chrome.tabs.onUpdated.hasListener(tabUpdateListener)) {
        chrome.tabs.onUpdated.addListener(tabUpdateListener)
    }
}

async function loadContentScripts(tabId: number, tabUrl: string) {
    if (!chrome.scripting) {
        return
    }

    const hostname = getHostname(tabUrl)
    const contentScripts = await chrome.scripting.getRegisteredContentScripts({
        ids: [SCRIPT_ID],
    })

    const isGranted = await chrome.permissions.contains({
        permissions: ["scripting"],
        origins: [ALL_HOSTS_WILDCARD],
    })

    if (!isGranted) {
        return
    }

    if (contentScripts.length === 1) {
        const contentScript = contentScripts[0]

        if (!contentScript.matches?.includes(hostname)) {
            if (await isRegisteredEnvironment(tabUrl)) {
                await chrome.scripting.updateContentScripts([
                    { id: SCRIPT_ID, js: [SCRIPT_FILE], matches: [...(contentScript?.matches || []), hostname] },
                ])

                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: [SCRIPT_FILE],
                })
            }
        }
    } else {
        if (await isRegisteredEnvironment(tabUrl)) {
            await chrome.scripting.registerContentScripts([{ id: SCRIPT_ID, js: [SCRIPT_FILE], matches: [hostname] }])

            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: [SCRIPT_FILE],
            })
        }
    }
}

async function isRegisteredEnvironment(url: string): Promise<boolean> {
    const environments: Environment[] = await getEnvironments()

    for (const environment of environments) {
        if (environment.matches(url)) {
            return true
        }
    }

    return false
}

function getHostname(url: string): string {
    const splitUrl = url.split("/")

    const protocol = splitUrl[0]
    const host = splitUrl[2]

    return protocol + "//" + host + "/*"
}
