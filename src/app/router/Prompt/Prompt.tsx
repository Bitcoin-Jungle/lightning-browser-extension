import AccountMenu from "@components/AccountMenu";
import ConfirmKeysend from "@screens/ConfirmKeysend";
import ConfirmPayment from "@screens/ConfirmPayment";
import ConfirmSignMessage from "@screens/ConfirmSignMessage";
import Enable from "@screens/Enable";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLChannel from "@screens/LNURLChannel";
import LNURLPay from "@screens/LNURLPay";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import MakeInvoice from "@screens/MakeInvoice";
import Unlock from "@screens/Unlock";
import { HashRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Providers from "~/app/context/Providers";
import RequireAuth from "~/app/router/RequireAuth";
import NostrConfirmGetPublicKey from "~/app/screens/Nostr/ConfirmGetPublicKey";
import type { NavigationState, OriginData } from "~/types";

// Parse out the parameters from the querystring.
const params = new URLSearchParams(window.location.search);

const getParamValues = (params: URLSearchParams, key: string) => {
  const valueFromKey = params.get(key);
  if (!!valueFromKey && typeof valueFromKey === "string") {
    try {
      return JSON.parse(valueFromKey as string);
    } catch (e) {
      // not valid JSON, let's return only the string
      return valueFromKey;
    }
  }
};

const createStateFromParams = (params: URLSearchParams): NavigationState => ({
  origin: getParamValues(params, "origin"),
  args: getParamValues(params, "args") || {}, // important: args can be null
  action: getParamValues(params, "action"),
  isPrompt: true,
});

const navigationState = createStateFromParams(params);
function Prompt() {
  return (
    <Providers>
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route
              index
              element={
                <Navigate
                  to={`/${navigationState.action}`}
                  replace
                  state={navigationState}
                />
              }
            />
            <Route
              path="public/webln/enable"
              element={<Enable origin={navigationState.origin as OriginData} />} // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/nostr/confirmGetPublicKey"
              element={<NostrConfirmGetPublicKey />}
            />

            <Route path="lnurlAuth" element={<LNURLAuth />} />
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route path="lnurlWithdraw" element={<LNURLWithdraw />} />
            <Route path="lnurlChannel" element={<LNURLChannel />} />
            <Route path="makeInvoice" element={<MakeInvoice />} />
            <Route path="confirmPayment" element={<ConfirmPayment />} />
            <Route path="confirmKeysend" element={<ConfirmKeysend />} />
            <Route path="confirmSignMessage" element={<ConfirmSignMessage />} />
          </Route>
          <Route
            path="unlock"
            element={
              <>
                <Unlock />
                <ToastContainer autoClose={10000} hideProgressBar={true} />
              </>
            }
          />
        </Routes>
      </HashRouter>
    </Providers>
  );
}

const Layout = () => {
  return (
    <>
      <ToastContainer autoClose={10000} hideProgressBar={true} />
      <div className="px-4 py-2 bg-white flex border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
        <AccountMenu showOptions={false} />
      </div>

      <main className="flex flex-col grow min-h-0">
        <Outlet />
      </main>
    </>
  );
};

export default Prompt;
