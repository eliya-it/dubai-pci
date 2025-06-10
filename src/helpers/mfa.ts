import { authenticator } from "otplib";

import * as qrcode from "qrcode";

export const generateTotpSecret = (email: string) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "Dubai_PCI", secret);
  return { secret, otpauth };
};

export const generateQrCodeImage = async (otpauthUrl: string) => {
  return await qrcode.toDataURL(otpauthUrl); // this will return base64
};

export const verifyTotp = (token: string, secret: string) => {
  return authenticator.check(token, secret);
};
