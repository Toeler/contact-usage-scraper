import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface AxiosMetaData {
	requestStartedAt?: number;
}

axios.interceptors.request.use((req: AxiosRequestConfig & { meta: AxiosMetaData }) => {
    req.meta = req.meta || {};
    req.meta.requestStartedAt = new Date().getTime();
    return req;
});
axios.interceptors.response.use((res: AxiosResponse & { config: AxiosRequestConfig & { meta: AxiosMetaData } }) => {
	console.log(`Execution time for: ${res.config.url} (${res.status}) - ${new Date().getTime() - res.config.meta.requestStartedAt} ms`)
	return res;
},
// Handle 4xx & 5xx responses
res => {
	console.error(`Execution time for: ${res.config.url} (${res.status}) - ${new Date().getTime() - res.config.meta.requestStartedAt} ms`)
	throw res;
});

export default axios;