import * as accounts from "./actions/accounts";
import * as allowances from "./actions/allowances";
import * as blocklist from "./actions/blocklist";
import * as cache from "./actions/cache";
import * as ln from "./actions/ln";
import lnurl, { auth } from "./actions/lnurl";
import * as nostr from "./actions/nostr";
import * as payments from "./actions/payments";
import * as settings from "./actions/settings";
import * as setup from "./actions/setup";
import * as webln from "./actions/webln";

const routes = {
  addAllowance: allowances.add,
  getAllowance: allowances.get,
  getAllowanceById: allowances.getById,
  listAllowances: allowances.list,
  deleteAllowance: allowances.deleteAllowance,
  updateAllowance: allowances.updateAllowance,
  lock: accounts.lock,
  unlock: accounts.unlock,
  getInfo: ln.getInfo,
  getInvoices: ln.invoices,
  sendPayment: ln.sendPayment,
  keysend: ln.keysend,
  checkPayment: ln.checkPayment,
  signMessage: ln.signMessage,
  makeInvoice: ln.makeInvoice,
  connectPeer: ln.connectPeer,
  getPayments: payments.all,
  accountInfo: accounts.info,
  accountDecryptedDetails: accounts.decryptedDetails,
  addAccount: accounts.add,
  editAccount: accounts.edit,
  getAccounts: accounts.all,
  removeAccount: accounts.remove,
  selectAccount: accounts.select,
  setPassword: setup.setPassword,
  reset: setup.reset,
  status: setup.status,
  validateAccount: setup.validateAccount,
  setIcon: setup.setIconMessageHandler,
  changePassword: settings.changePassword,
  setSetting: settings.set,
  getSettings: settings.get,
  addBlocklist: blocklist.add,
  deleteBlocklist: blocklist.deleteBlocklist,
  getBlocklist: blocklist.get,
  listBlocklist: blocklist.list,
  lnurl: lnurl,
  lnurlAuth: auth,
  getCurrencyRate: cache.getCurrencyRate,
  nostr: {
    generatePrivateKey: nostr.generatePrivateKey,
    getPrivateKey: nostr.getPrivateKey,
    setPrivateKey: nostr.setPrivateKey,
  },

  // Public calls are accessible from inpage scripts
  public: {
    webln: {
      enable: allowances.enable,
      getInfo: ln.getInfo,
      sendPaymentOrPrompt: webln.sendPaymentOrPrompt,
      keysendOrPrompt: webln.keysendOrPrompt,
      signMessageOrPrompt: webln.signMessageOrPrompt,
      lnurl: webln.lnurl,
      makeInvoice: webln.makeInvoiceOrPrompt,
    },
    nostr: {
      getPublicKeyOrPrompt: nostr.getPublicKeyOrPrompt,
      signEventOrPrompt: nostr.signEventOrPrompt,
      getRelays: nostr.getRelays,
    },
  },
};

const router = (path: FixMe) => {
  if (!path) {
    throw new Error("No action path provided to router");
  }
  const routeParts = path.split("/");
  const route = routeParts.reduce((route: FixMe, path: FixMe) => {
    return route[path];
  }, routes);

  if (!route) {
    console.warn(`Route not found: ${path}`);
    // return a function to keep the expected method signature
    return () => {
      return Promise.reject({ error: `${path} not found}` });
    };
  }
  return route;
};

export { routes, router };
