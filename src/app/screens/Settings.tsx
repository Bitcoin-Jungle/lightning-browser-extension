import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import Container from "@components/Container";
import LocaleSwitcher from "@components/LocaleSwitcher/LocaleSwitcher";
import PasswordForm from "@components/PasswordForm";
import Setting from "@components/Setting";
import Input from "@components/form/Input";
import Select from "@components/form/Select";
import Toggle from "@components/form/Toggle";
import { Html5Qrcode } from "html5-qrcode";
import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { getTheme } from "~/app/utils";
import { CURRENCIES } from "~/common/constants";
import api from "~/common/lib/api";
import utils from "~/common/lib/utils";
import { SettingsStorage } from "~/types";

const initialFormData = {
  password: "",
  passwordConfirmation: "",
};

function Settings() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });

  const { fetchAccountInfo } = useAccount();

  const [loading, setLoading] = useState(true);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [settings, setSettings] = useState<SettingsStorage>({
    websiteEnhancements: false,
    legacyLnurlAuth: false,
    isUsingLegacyLnurlAuthKey: false,
    userName: "",
    userEmail: "",
    locale: "",
    theme: "system",
    currency: CURRENCIES.USD,
    exchange: "coindesk",
    debug: false,
  });

  const [cameraPermissionsGranted, setCameraPermissionsGranted] =
    useState(false);

  function closeModal() {
    setModalIsOpen(false);
  }

  async function updateAccountPassword(password: string) {
    await utils.call("changePassword", {
      password: formData.password,
    });
    toast.success("Password changed successfully!");
    closeModal();
  }

  async function saveSetting(
    setting: Record<string, string | number | boolean>
  ) {
    const response = await api.setSetting(setting);
    setSettings(response);
  }

  useEffect(() => {
    api.getSettings().then((response) => {
      setSettings(response);
      setLoading(false);
    });
  }, []);

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold dark:text-white">
        {t("headline")}
      </h2>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting
          title={t("website_enhancements.title")}
          subtitle={t("website_enhancements.subtitle")}
        >
          {!loading && (
            <Toggle
              checked={settings.websiteEnhancements}
              onChange={() => {
                saveSetting({
                  websiteEnhancements: !settings.websiteEnhancements,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title={t("legacy_lnurl_auth.title")}
          subtitle={t("legacy_lnurl_auth.subtitle")}
        >
          {!loading && (
            <Toggle
              checked={settings.legacyLnurlAuth}
              onChange={() => {
                saveSetting({
                  legacyLnurlAuth: !settings.legacyLnurlAuth,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title="Legacy LNURL-Auth"
          subtitle="The key generation for LNURL-auth has changed. Due to an error Alby was not compatible with other implementations. This was fixed, but now different keys are used. If you used LNURL-auth to login before you can still enable the old method. This option will be removed later, make sure to switch to the new login."
        >
          {!loading && (
            <Toggle
              checked={settings.isUsingLegacyLnurlAuthKey}
              onChange={() => {
                saveSetting({
                  legacyLnurlAuthKey: !settings.isUsingLegacyLnurlAuthKey,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title={t("camera_access.title")}
          subtitle={t("camera_access.subtitle")}
        >
          {!cameraPermissionsGranted ? (
            <Button
              label={t("camera_access.label")}
              onClick={async () => {
                try {
                  await Html5Qrcode.getCameras();
                  setCameraPermissionsGranted(true);
                } catch (e) {
                  if (e instanceof Error) toast.error(e.message);
                }
              }}
            />
          ) : (
            <p className="text-green-500 font-medium">
              {t("camera_access.active")}
            </p>
          )}
        </Setting>

        <Setting title={t("language.title")} subtitle={t("language.subtitle")}>
          <div className="w-32">
            <LocaleSwitcher />
          </div>
        </Setting>

        <Setting title={t("theme.title")} subtitle={t("theme.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Select
                name="theme"
                value={settings.theme}
                onChange={async (event) => {
                  await saveSetting({
                    theme: event.target.value,
                  });
                  getTheme(); // Get the active theme and apply corresponding Tailwind classes to the document
                }}
              >
                <option value="dark">{t("theme.options.dark")}</option>
                <option value="light">{t("theme.options.light")}</option>
                <option value="system">{t("theme.options.system")}</option>
              </Select>
            </div>
          )}
        </Setting>

        <Setting title={t("currency.title")} subtitle={t("currency.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Select
                name="currency"
                value={settings.currency}
                onChange={async (event) => {
                  fetchAccountInfo({ isLatestRate: true });
                  await saveSetting({
                    currency: event.target.value,
                  });
                }}
              >
                {Object.keys(CURRENCIES).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </Setting>

        <Setting title={t("exchange.title")} subtitle={t("exchange.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Select
                name="exchange"
                value={settings.exchange}
                onChange={async (event) => {
                  // exchange/value change should be reflected in the upper account-menu after select?
                  await saveSetting({
                    exchange: event.target.value,
                  });
                }}
              >
                <option value="alby">Alby</option>
                <option value="coindesk">Coindesk</option>
                <option value="yadio">yadio</option>
              </Select>
            </div>
          )}
        </Setting>

        <Setting
          title={t("change_password.title")}
          subtitle={t("change_password.subtitle")}
        >
          {!loading && (
            <div className="w-64">
              <Button
                onClick={() => {
                  setModalIsOpen(true);
                }}
                label={t("change_password.title")}
                primary
                fullWidth
                loading={loading}
                disabled={loading}
              />
            </div>
          )}
        </Setting>
      </div>

      <h2 className="mt-12 text-2xl font-bold dark:text-white">
        {t("personal_data.headline")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
        {t("personal_data.info")}
      </p>

      <div className="mb-12 shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting title={t("name.title")} subtitle={t("name.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Input
                placeholder={t("name.placeholder")}
                type="text"
                value={settings.userName}
                onChange={(event) => {
                  saveSetting({
                    userName: event.target.value,
                  });
                }}
              />
            </div>
          )}
        </Setting>

        <Setting title={t("email.title")} subtitle={t("email.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Input
                placeholder={t("email.placeholder")}
                type="email"
                value={settings.userEmail}
                onChange={(event) => {
                  saveSetting({
                    userEmail: event.target.value,
                  });
                }}
              />
            </div>
          )}
        </Setting>

        <Modal
          closeTimeoutMS={200}
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit account name"
          overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
          className="rounded-lg bg-white w-full max-w-lg"
        >
          <div className="p-5 flex justify-between dark:bg-surface-02dp">
            <h2 className="text-2xl font-bold dark:text-white">
              Change Password
            </h2>
            <button onClick={closeModal}>
              <CrossIcon className="w-6 h-6 dark:text-white" />
            </button>
          </div>

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              updateAccountPassword(formData.password);
            }}
          >
            <div className="p-5 border-t border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
              <PasswordForm
                i18nKeyPrefix="settings.change_password"
                formData={formData}
                setFormData={setFormData}
              />
            </div>

            <div className="flex justify-end p-5 dark:bg-surface-02dp">
              <Button
                label="Change"
                type="submit"
                primary
                disabled={
                  !formData.password ||
                  formData.password !== formData.passwordConfirmation
                }
              />
            </div>
          </form>
        </Modal>
      </div>

      <h2 className="mt-12 text-2xl font-bold dark:text-white">LNURL-Auth</h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
        <a
          href="https://lightninglogin.live/learn"
          target="_blank"
          rel="noreferrer"
        >
          LNURL-auth
        </a>{" "}
        is a generic authentication protocol. It authenticates the user using
        digital signatures. The protocol does not require any other identifying
        information such as passwords, emails, usernames, or similar. With Alby
        you can use your lightning accounts to securely login to websites.
        <br />
        To be compatible with other wallets we had to make a few changes that
        you can configure here. <br />
        <strong>Ideally all those options are OFF.</strong> Use them only if you
        have old accounts.
      </p>

      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting
          title="Legacy LNURL-Auth"
          subtitle="The key generation for LNURL-auth has changed (July 2022). Alby was not compatible with other implementations. This was changed, but now different login keys are used. If you used LNURL-auth to login before you can still enable the old method. This option will be removed later, make sure to switch to the new login."
        >
          {!loading && (
            <Toggle
              checked={settings.isUsingLegacyLnurlAuthKey}
              onChange={() => {
                saveSetting({
                  isUsingLegacyLnurlAuthKey:
                    !settings.isUsingLegacyLnurlAuthKey,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title="Legacy signing for LNDhub and LNBits"
          subtitle="Message signing and login with LNDhub (e.g. BlueWallet) and LNbits accounts has been changed (March 2022). If you logged in with these accounts you can still enable the old signing method. This option will be removed later, make sure to switch to the new login."
        >
          {!loading && (
            <Toggle
              checked={settings.legacyLnurlAuth}
              onChange={() => {
                saveSetting({
                  legacyLnurlAuth: !settings.legacyLnurlAuth,
                });
              }}
            />
          )}
        </Setting>
      </div>
    </Container>
  );
}

export default Settings;
