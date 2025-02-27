import browser, { Runtime, Tabs } from "webextension-polyfill";
import utils from "~/common/lib/utils";

import { ExtensionIcon, setIcon } from "./actions/setup/setIcon";
import connectors from "./connectors";
import db from "./db";
import * as events from "./events";
import migrate from "./migrations";
import { router } from "./router";
import state from "./state";

let isFirstInstalled = false;
let isRecentlyUpdated = false;

// when debugging is enabled in development mode a window.debugAlby object is defined that can be used within the console. This is the type interface for that
declare global {
  interface Window {
    debugAlby: unknown;
  }
}

/* debug help to check the current state
setInterval(() => {
  console.log(state.getState());
}, 5000);
*/

const extractLightningData = (
  tabId: number,
  changeInfo: Tabs.OnUpdatedChangeInfoType,
  tabInfo: Tabs.Tab
) => {
  if (changeInfo.status === "complete" && tabInfo.url?.startsWith("http")) {
    // Adding a short delay because I've seen cases where this call has happened too fast
    // before the receiving side in the content-script was connected/listening
    setTimeout(() => {
      browser.tabs.sendMessage(tabId, {
        action: "extractLightningData",
      });
    }, 150);
  }
};

const updateIcon = async (
  tabId: number,
  changeInfo: Tabs.OnUpdatedChangeInfoType,
  tabInfo: Tabs.Tab
) => {
  if (changeInfo.status !== "complete" || !tabInfo.url?.startsWith("http")) {
    return;
  }

  const url = new URL(tabInfo.url);

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(url.host)
    .first();

  await setIcon(
    allowance ? ExtensionIcon.Active : ExtensionIcon.Default,
    tabId
  );
};

const debugLogger = (message: unknown, sender: Runtime.MessageSender) => {
  if (state.getState().settings.debug) {
    console.info("Background onMessage: ", message, sender);
  }
};

const handleInstalled = (details: { reason: string }) => {
  console.info(`Handle installed: ${details.reason}`);
  // TODO: maybe check if accounts are already configured?
  if (details.reason === "install") {
    isFirstInstalled = true;
  }
  if (details.reason === "update") {
    console.info("Alby was recently updated");
    isRecentlyUpdated = true;
  }
};

// listen to calls from the content script and calls the actions through the router
// returns a promise to be handled in the content script
const routeCalls = (
  message: {
    application: string;
    prompt: boolean;
    type: string;
    action: string;
  },
  sender: Runtime.MessageSender
) => {
  // if the application does not match or if it is not a prompt we ignore the call
  if (message.application !== "LBE" || !message.prompt) {
    return;
  }
  const debug = state.getState().settings.debug;

  if (message.type) {
    console.error("Invalid message, using type: ", message);
  }
  const action = message.action || message.type;
  console.info(`Routing call: ${action}`);
  // Potentially check for internal vs. public calls
  const call = router(action)(message, sender);

  // Log the action response if we are in debug mode
  if (debug) {
    call.then((r: unknown) => {
      console.info(`${action} response:`, r);
      return r;
    });
  }
  return call;
};

async function init() {
  console.info("Loading background script");

  //await browser.storage.sync.set({ settings: { debug: true }, allowances: [] });
  await state.getState().init();
  console.info("State loaded");

  await db.open();
  console.info("DB opened");

  events.subscribe();
  console.info("Events subscribed");

  browser.runtime.onMessage.addListener(debugLogger);

  // this is the only handler that may and must return a Promise which resolve with the response to the content script
  browser.runtime.onMessage.addListener(routeCalls);

  // Update the extension icon
  browser.tabs.onUpdated.addListener(updateIcon);

  // Notify the content script that the tab has been updated.
  browser.tabs.onUpdated.addListener(extractLightningData);

  if (state.getState().settings.debug) {
    console.info("Debug mode enabled, use window.debugAlby");
    window.debugAlby = {
      state,
      db,
      connectors,
      router,
    };
  }
  console.info("Loading completed");
}

// The onInstalled event is fired directly after the code is loaded.
// When we subscribe to that event asynchronously in the init() function it is too late and we miss the event.
browser.runtime.onInstalled.addListener(handleInstalled);

console.info("Welcome to Alby");
init().then(() => {
  if (isFirstInstalled) {
    utils.openUrl("welcome.html");
  }
  if (isRecentlyUpdated) {
    migrate();
  }
});

browser.runtime.setUninstallURL("https://getalby.com/goodbye");
