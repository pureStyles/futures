

const serverConfig = {
    baseURL: "https://www.jiaoyikecha.com",
    useTokenAuthorization: false,
};

/** 本地使用 */
const cookie = "UM_distinctid=19b46aa610a6cc-03ff4d59c2f8418-1a525636-16a7f0-19b46aa610b1ed1; cna=8f901ebadbff4ce7a9f8b40bc7c2d85d; Hm_lvt_c54eb5f0c700b7d446674a77b06c4d24=1767288048; Hm_lvt_82e02aae42734877305ee2d72ac6e6ad=1769526027,1770474765; HMACCOUNT=09B9E982A65E4064; PHPSESSID=a6154ba1b1f153f68395971013acf86c; remember=58837b74c873b3e223f5137e665a6715; Hm_lpvt_82e02aae42734877305ee2d72ac6e6ad=1771297143; CNZZDATA1281432570=2109629325-1766417130-https%253A%252F%252Fwww.google.com.hk%252F%7C1771297143";

const getHeaders = () => {
    return {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,ar;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "cookie": process.env.USER_COOKIE || cookie,
        "Referer": "https://www.jiaoyikecha.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
}


module.exports = {
    serverConfig,
    getHeaders,
}
