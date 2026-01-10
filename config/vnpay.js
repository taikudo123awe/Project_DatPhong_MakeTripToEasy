// config/vnpay.js
const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');

exports.sortObject = (obj) => {
  let sorted = {};
  let str = Object.keys(obj);
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

exports.createPaymentUrl = (vnp_TxnRef, amount, orderInfo, ipAddr, extraData = "") => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const vnp_TmnCode = process.env.VNP_TMN_CODE;
  const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  const vnp_Url = process.env.VNP_URL;
  const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = vnp_TxnRef;
  // Nhúng extraData vào OrderInfo để nhận lại khi return
  vnp_Params['vnp_OrderInfo'] = orderInfo + '|' + Buffer.from(extraData).toString('base64');
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr.includes("::1") ? "127.0.0.1" : ipAddr.split(",")[0];
  vnp_Params['vnp_CreateDate'] = moment().format('YYYYMMDDHHmmss');

  vnp_Params = exports.sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  vnp_Params['vnp_SecureHash'] = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  return vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
};

exports.verifyReturn = (vnp_Params) => {
  const vnp_SecureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];
  const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  const sortedParams = exports.sortObject(vnp_Params);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  return secureHash === vnp_SecureHash;
};