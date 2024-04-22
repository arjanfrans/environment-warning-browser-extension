import { Environment } from "./model/Environment"
import { enableExtension, getEnvironments, isExtensionEnabled } from "./storage/storage"
import { ALL_HOSTS_WILDCARD } from "./config/config"
import TabChangeInfo = chrome.tabs.TabChangeInfo
import Tab = chrome.tabs.Tab
import { sleep } from "./helper/sleep"

const SCRIPT_ID = "content"
const SCRIPT_FILE = "content.js"
const ENABLE_DISABLE_CONTEXT_MENU_ITEM = "enable_disable_menu_item"

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
    })

    chrome.contextMenus.onClicked.addListener(async (info) => {
        if (info.menuItemId === ENABLE_DISABLE_CONTEXT_MENU_ITEM) {
            const isEnabled = await isExtensionEnabled()

            await Promise.all([await enableExtension(!isEnabled), sleep(300)])

            chrome.contextMenus.update(ENABLE_DISABLE_CONTEXT_MENU_ITEM, {
                title: isEnabled ? "Disable" : "Enable",
            })
        }
    })

    chrome.storage.onChanged.addListener(async (changes, namespace) => {
        if (!changes.enabled || namespace !== "local") {
            return
        }

        if (tabUpdateListener) {
            if (changes.enabled.newValue === false) {
                chrome.tabs.onUpdated.removeListener(tabUpdateListener)

                await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] })
            } else {
                chrome.tabs.onUpdated.addListener(tabUpdateListener)
            }
        }
    })

    if (!(await isExtensionEnabled())) {
        return
    }

    chrome.tabs.onUpdated.addListener(tabUpdateListener)
})()

async function loadContentScripts(tabId: number, tabUrl: string) {
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
