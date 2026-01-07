

const serverConfig = {
    baseURL: "https://www.jiaoyikecha.com",
    useTokenAuthorization: false,
};

const getHeaders = () => {
    console.log("xxx", process.env.USER_COOKIE);
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
        "cookie": process.env.USER_COOKIE,
        "Referer": "https://www.jiaoyikecha.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
}


module.exports = {
    serverConfig,
    getHeaders,
}
