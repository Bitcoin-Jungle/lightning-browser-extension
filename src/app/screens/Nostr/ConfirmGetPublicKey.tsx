import { CheckIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import { useTranslation } from "react-i18next";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import { OriginData } from "~/types";

function NostrConfirmGetPublicKey() {
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const { t: tCommon } = useTranslation("common");
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;

  function enable() {
    msg.reply({
      confirm: true,
    });
  }

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  async function block(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await utils.call("addBlocklist", {
      domain: origin.domain,
      host: origin.host,
    });
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <Container justifyBetween maxWidth="sm">
        <div>
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
            isSmall={false}
          />

          <div className="dark:text-white pt-6">
            <p className="mb-4">{t("allow", { host: origin.host })}</p>
            <div className="mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p className="dark:text-white">{t("read_public_key")}</p>
            </div>
          </div>
        </div>
        <div className="mb-4 text-center flex flex-col">
          <ConfirmOrCancel
            label={tCommon("actions.connect")}
            onConfirm={enable}
            onCancel={reject}
          />
          <a
            className="underline text-sm text-gray-400 mx-4 overflow-hidden text-ellipsis whitespace-nowrap"
            href="#"
            onClick={block}
          >
            {t("block_and_ignore", { host: origin.host })}
          </a>
        </div>
      </Container>
    </div>
  );
}

export default NostrConfirmGetPublicKey;
