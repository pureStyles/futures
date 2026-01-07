const axios = require("axios");
const { serverConfig, getHeaders } = require("./config.js");

const serviceAxios = axios.create({
    baseURL: serverConfig.baseURL,
    timeout: 30000,
    withCredentials: false,
});

// 自定义配置：最大重试次数和重试间隔
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000; // 1秒

serviceAxios.interceptors.request.use((config => {
    config.headers = { ...config.headers, ...getHeaders() };
    console.log('headers', headers);
    return config;
}), error => {
    return Promise.reject(error);
});

serviceAxios.interceptors.response.use((response) => {
    const { data: _data } = response || {};
    const { code, data, msg } = _data || {};
    if (code !== 0) {
        return Promise.reject(new Error(msg || '❌code is not 0'));
    }
    return data;
}, (error) => {
    const { config } = error;

    // 如果 config 不存在，或者未开启重试配置，直接抛出错误
    if (!config) return Promise.reject(error);

    // 设置标识符来跟踪重试次数
    config.__retryCount = config.__retryCount || 0;

    // 检查是否是因为超时（timeout）导致，并且次数未达上限
    // code === 'ECONNABORTED' 是 axios 超时的典型错误码
    if (config.__retryCount < MAX_RETRY_COUNT) {
        config.__retryCount += 1;

        console.warn(`请求超时，正在进行第 ${config.__retryCount} 次重试...`);

        // 创建一个新的 Promise 来处理重试间的延迟
        const backoff = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, RETRY_DELAY);
        });

        // 重新发起请求
        return backoff.then(() => serviceAxios(config));
    }

    return Promise.reject(error);
});

module.exports = serviceAxios;