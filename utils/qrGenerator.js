import QRCode from "qrcode";

export const generateQrDataUrl = async (payload) => {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  return await QRCode.toDataURL(text, { errorCorrectionLevel: "M" });
};

