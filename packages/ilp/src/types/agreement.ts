export type Agreement = {
  id: string;
  userId: string;
  accountId: string;
  asset: {
    code: string;
    scale: number;
  };
  amount: string;
  subject?: string;
  start?: number;
  expiry?: number;
  interval?: string;
  cycles?: number;
  cap?: boolean;
  callbackUrl?: string;
  callbackAuthToken?: string;
}
