import { PaymentRequestObject } from "bolt11";
import { CURRENCIES } from "~/common/constants";
import connectors from "~/extension/background-script/connectors";
import {
  ConnectorInvoice,
  SendPaymentResponse,
  WebLNNode,
} from "~/extension/background-script/connectors/connector.interface";

import { Event } from "./extension/ln/nostr/types";

export type ConnectorType = keyof typeof connectors;

export interface Account {
  id: string;
  connector: ConnectorType;
  config: string;
  name: string;
}

export interface Accounts {
  [id: string]: Account;
}

export interface NodeInfo {
  node: WebLNNode;
}
export interface AccountInfo {
  alias: string;
  balance: number;
  fiatBalance?: string;
  id: string;
  name: string;
  satsBalance?: string;
}

export interface MetaData {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  keywords?: string[];
  language?: string;
  type?: string;
  url?: string;
  provider?: string;
  [x: string]: string | string[] | undefined;
}

export interface OriginData {
  location: string;
  domain: string;
  host: string;
  pathname: string;
  name: string;
  description: string;
  icon: string;
  metaData: MetaData;
  external: boolean;
}

export interface PaymentNotificationData {
  paymentRequestDetails?: PaymentRequestObject | undefined;
  response: SendPaymentResponse | { error: string };
  origin?: OriginData;
  details: {
    destination?: string | undefined;
    description?: string | undefined;
  };
}

export interface AuthResponseObject {
  reason?: string;
  status: string;
}
export interface AuthNotificationData {
  authResponse: AuthResponseObject;
  origin?: OriginData; // only set if triggered via Prompt
  lnurlDetails: LNURLAuthServiceResponse;
}

export interface OriginDataInternal {
  internal: boolean;
}

export interface Battery extends OriginData {
  method: string;
  address: string;
  customKey?: string;
  customValue?: string;
  suggested?: string;
  name: string;
  icon: string;
}

export type BatteryMetaTagRecipient = Pick<
  Battery,
  "address" | "customKey" | "customValue" | "method"
>;

export type LnurlAuthResponse = {
  success: boolean;
  status: string;
  reason?: string;
  authResponseData: unknown;
};

/**
 * @deprecated Use MessageDefault instead
 */
export interface Message {
  action?: string;
  application?: string;
  args: Record<string, unknown>;
  origin: OriginData | OriginDataInternal;
  prompt?: boolean;
}

// new message  type, please use this
export interface MessageDefault {
  origin: OriginData | OriginDataInternal;
  application?: string;
  prompt?: boolean;
}

export type NavigationState = {
  origin?: OriginData; // only defoned if coming via "Prompt", can be empty if a LNURL-action is being used via "Send" within the "PopUp"
  args?: {
    lnurlDetails: LNURLDetails;
    amountEditable?: boolean;
    memoEditable?: boolean;
    invoiceAttributes?: RequestInvoiceArgs;
    paymentRequest?: string;
    destination?: string;
    amount?: string;
    customRecords?: Record<string, string>;
    message?: string;
  };
  isPrompt?: true; // only passed via Prompt.tsx
  action: string;
};

export interface MessagePaymentAll extends MessageDefault {
  action: "getPayments";
  args?: {
    limit?: number;
  };
}

export interface MessageAccountRemove extends MessageDefault {
  args?: { id: Account["id"] };
  action: "removeAccount";
}

export interface MessageAccountAdd extends MessageDefault {
  args: Omit<Account, "id">;
  action: "addAccount";
}
export interface MessageAccountEdit extends MessageDefault {
  args: {
    id: Account["id"];
    name: Account["name"];
  };
  action: "editAccount";
}
export interface MessageAccountDecryptedDetails extends MessageDefault {
  args: {
    id: Account["id"];
    name: Account["name"];
  };
  action: "accountDecryptedDetails";
}

export interface MessageAccountInfo extends MessageDefault {
  action: "accountInfo";
}

export interface MessageAccountAll extends MessageDefault {
  action: "getAccounts";
}

export interface MessageBlocklistAdd extends MessageDefault {
  args: {
    host: string;
    name: string;
    imageURL: string;
  };
  action: "addBlocklist";
}

export interface MessageBlocklistDelete extends MessageDefault {
  args: {
    host: string;
  };
  action: "deleteBlocklist";
}

export interface MessageBlocklistGet extends MessageDefault {
  args: {
    host: string;
  };
  action: "getBlocklist";
}

export interface MessageSetIcon extends MessageDefault {
  action: "setIcon";
  args: {
    icon: string;
  };
}

export interface MessageAccountLock extends MessageDefault {
  action: "lock";
}

export interface MessageAccountUnlock extends MessageDefault {
  args: { password: string | number };
  action: "unlock";
}

export interface MessageAccountSelect extends MessageDefault {
  args: { id: Account["id"] };
  action: "selectAccount";
}

export interface MessageAllowanceAdd extends MessageDefault {
  args: {
    name: Allowance["name"];
    host: Allowance["host"];
    imageURL: Allowance["imageURL"];
    totalBudget: Allowance["totalBudget"];
  };
  action: "addAllowance";
}

export interface MessageAllowanceList extends MessageDefault {
  action: "listAllowances";
}

export interface MessageInvoices extends Omit<MessageDefault, "args"> {
  args: { limit?: number; isSettled?: boolean };
  action: "getInvoices";
}

export interface MessageAllowanceEnable extends MessageDefault {
  origin: OriginData;
  args: {
    host: Allowance["host"];
  };
  action: "enableAllowance";
}

export interface MessageAllowanceDelete extends MessageDefault {
  args: {
    id: Allowance["id"];
  };
  action: "deleteAllowance";
}

export interface MessageAllowanceUpdate extends MessageDefault {
  args: {
    enabled?: Allowance["enabled"];
    id: Allowance["id"];
    lnurlAuth?: Allowance["lnurlAuth"];
    totalBudget?: Allowance["totalBudget"];
  };
  action: "updateAllowance";
}

export interface MessageAllowanceGet extends MessageDefault {
  args: { host: Allowance["host"] };
  action: "getAllowance";
}

export interface MessageAllowanceGetById extends MessageDefault {
  args: { id: Allowance["id"] };
  action: "getAllowanceById";
}

export interface MessageWebLnLnurl extends MessageDefault {
  args: { lnurlEncoded: string };
  public: boolean;
  action: "webln/lnurl";
}

export interface MessageConnectPeer extends MessageDefault {
  args: { pubkey: string; host: string };
  action: "connectPeer";
}

export interface MessageLnurlAuth {
  args: {
    origin?: OriginData; // only set if triggered via Prompt
    lnurlDetails: {
      tag: "login";
      k1: string;
      url: string;
      domain: string;
    };
  };
  action: "lnurlAuth";
}

export interface MessageSendPayment extends MessageDefault {
  args: {
    paymentRequest: string;
  };
  action: "sendPayment";
}

export interface MessageSettingsSet extends MessageDefault {
  args: { setting: Partial<SettingsStorage> };
  action: "setSetting";
}

export interface MessageCurrencyRateGet extends MessageDefault {
  action: "getCurrencyRate";
}

export interface MessagePublicKeyGet extends MessageDefault {
  action: "getPublicKeyOrPrompt";
}

export interface MessagePrivateKeySet extends MessageDefault {
  args: {
    privateKey: string;
  };
  action: "setPrivateKey";
}

export interface MessageSignEvent extends MessageDefault {
  args: {
    event: Event;
    message: string;
  };
  action: "signEvent";
}

export interface LNURLChannelServiceResponse {
  uri: string; // Remote node address of form node_key@ip_address:port_number
  callback: string; // a second-level URL which would initiate an OpenChannel message from target LN node
  k1: string; // random or non-random string to identify the user's LN WALLET when using the callback URL
  tag: "channelRequest"; // type of LNURL
  domain: string;
}

export interface LNURLPayServiceResponse {
  callback: string; // The URL from LN SERVICE which will accept the pay request parameters
  maxSendable: number; // Max amount LN SERVICE is willing to receive
  minSendable: number; // Min amount LN SERVICE is willing to receive, can not be less than 1 or more than `maxSendable`
  domain: string;
  metadata: string; // Metadata json which must be presented as raw string here, this is required to pass signature verification at a later step
  tag: "payRequest"; // Type of LNURL
  payerData?: {
    name: { mandatory: boolean };
    pubkey: { mandatory: boolean };
    identifier: { mandatory: boolean };
    email: { mandatory: boolean };
    auth: { mandatory: boolean; k1: string };
  };
  commentAllowed?: number;
  url: string;
}

export interface LNURLAuthServiceResponse {
  tag: "login"; // Type of LNURL
  k1: string; // (hex encoded 32 bytes of challenge) which is going to be signed by user's linkingPrivKey.
  action?: string; // optional action enum which can be one of four strings: register | login | link | auth.
  domain: string;
  url: string;
}

export interface LNURLWithdrawServiceResponse {
  tag: "withdrawRequest"; // type of LNURL
  callback: string; // The URL which LN SERVICE would accept a withdrawal Lightning invoice as query parameter
  k1: string; // Random or non-random string to identify the user's LN WALLET when using the callback URL
  defaultDescription: string; // A default withdrawal invoice description
  balanceCheck?: string;
  payLink?: string;
  minWithdrawable: number; // Min amount (in millisatoshis) the user can withdraw from LN SERVICE, or 0
  maxWithdrawable: number; // Max amount (in millisatoshis) the user can withdraw from LN SERVICE, or equal to minWithdrawable if the user has no choice over the amounts
  domain: string;
  url: string;
}

export interface LNURLChannelServiceResponse {
  uri: string; // Remote node address of form node_key@ip_address:port_number
  callback: string; // a second-level URL which would initiate an OpenChannel message from target LN node
  k1: string; // random or non-random string to identify the user's LN WALLET when using the callback URL
  tag: "channelRequest"; // type of LNURL
  url: string;
}

export interface LNURLError {
  status: "ERROR";
  reason: string;
}

export type LNURLDetails =
  | LNURLChannelServiceResponse
  | LNURLPayServiceResponse
  | LNURLAuthServiceResponse
  | LNURLWithdrawServiceResponse;

export interface LNURLPaymentSuccessAction {
  tag: string;
  description?: string;
  message?: string;
  url?: string;
}

export interface LNURLPaymentInfo {
  pr: string;
  successAction?: LNURLPaymentSuccessAction;
}

export interface RequestInvoiceArgs {
  amount?: string | number;
  defaultAmount?: string | number;
  minimumAmount?: string | number;
  maximumAmount?: string | number;
  defaultMemo?: string;
  memo?: string;
}

export interface IBadge {
  label: string;
  color: string;
  textColor: string;
}

export type Transaction = {
  amount?: string;
  boostagram?: Invoice["boostagram"];
  badges?: IBadge[];
  createdAt?: string;
  currency?: string;
  date: string;
  description?: string;
  host?: string;
  id: string;
  location?: string;
  name?: string;
  preimage: string;
  title: string | React.ReactNode;
  totalAmount: Allowance["payments"][number]["totalAmount"];
  totalAmountFiat?: string;
  totalFees?: Allowance["payments"][number]["totalFees"];
  type?: "sent" | "sending" | "received";
  value?: string;
  publisherLink?: string; // either the invoice URL if on PublisherSingleView, or the internal link to Publisher
};

export interface DbPayment {
  allowanceId: string;
  createdAt: string;
  description: string;
  destination: string;
  host?: string;
  id?: number;
  location?: string;
  name?: string;
  paymentHash: string;
  paymentRequest: string;
  preimage: string;
  totalAmount: number | string;
  totalFees: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Payment extends Omit<DbPayment, "id"> {
  id: number;
}

export interface PaymentResponse
  extends Pick<Payment, "destination" | "preimage" | "paymentHash"> {
  route: {
    total_time_lock: number;
    total_fees: string;
    total_amt: string;
    hops: {
      chan_id: string;
      chan_capacity: string;
      amt_to_forward: string;
      fee: string;
      expiry: number;
      amt_to_forward_msat: string;
      fee_msat: string;
      pub_key: string;
      tlv_payload: true;
      mpp_record: {
        payment_addr: string;
        total_amt_msat: string;
      };
      amp_record: null;
      custom_records: unknown;
    };
    total_fees_msat: string;
    total_amt_msat: string;
  };
}

export interface DbBlocklist {
  id?: number;
  host: string;
  name: string;
  imageURL: string;
  isBlocked: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Blocklist extends DbBlocklist {}

export interface DbAllowance {
  createdAt: string;
  enabled: boolean;
  host: string;
  id?: number;
  imageURL: string;
  lastPaymentAt: number;
  lnurlAuth: boolean;
  name: string;
  remainingBudget: number;
  tag: string;
  totalBudget: number;
}
export interface Allowance extends Omit<DbAllowance, "id"> {
  id: number;
  payments: Payment[];
  paymentsAmount: number;
  paymentsCount: number;
  percentage: string;
  usedBudget: number;
}

export interface SettingsStorage {
  browserNotifications: boolean;
  websiteEnhancements: boolean;
  legacyLnurlAuth: boolean;
  isUsingLegacyLnurlAuthKey: boolean;
  userName: string;
  userEmail: string;
  locale: string;
  theme: string;
  showFiat: boolean;
  currency: CURRENCIES;
  exchange: SupportedExchanges;
  debug: boolean;
  nostrEnabled: boolean;
}

export interface Badge {
  label: string;
  color: string;
  textColor: string;
}

export interface Publisher
  extends Pick<
    Allowance,
    | "host"
    | "imageURL"
    | "name"
    | "payments"
    | "paymentsAmount"
    | "paymentsCount"
    | "percentage"
    | "totalBudget"
    | "usedBudget"
  > {
  id: number;
  title?: string;
  badge?: {
    label: string;
    color: string;
    textColor: string;
  };
}

export type SupportedExchanges = "alby" | "coindesk" | "yadio";

export interface Invoice {
  id: string;
  memo: string;
  type: "received";
  settled: boolean;
  settleDate: number;
  totalAmount: string;
  totalAmountFiat?: string;
  preimage: string;
  custom_records?: ConnectorInvoice["custom_records"];
  boostagram?: {
    app_name: string;
    name: string;
    podcast: string;
    url: string;
    episode?: string;
    itemID?: string;
    ts?: string;
    message?: string;
    sender_id: string;
    sender_name: string;
    time: string;
    action: "boost";
    value_msat_total: number;
  };
}
