import axios, { AxiosRequestConfig } from "axios";

type AxiosResult<T> = T & {
  access_token?: string;
  lead_hash?: string;
};

const call = <T>(method: string) => {
  return async ({
    path,
    params,
    body,
    headers,
    data,
    options,
  }: {
    path: string;
    params?: any;
    body?: any;
    headers?: { [name: string]: string };
    data?: any;
    options?: AxiosRequestConfig;
  }): Promise<any> => {
    const url = `/api${path}`;

    const config: any = {
      ...options,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    } as AxiosRequestConfig;

    if (data) {
      config.data = data;
    } else if (["PUT", "POST", "PATCH"].includes(method)) {
      config.data = JSON.stringify(body);
    }

    config.params = {
      ...params,
    };

    const response = await axios<AxiosResult<T>>(url, config);

    return response.data;
  };
};

export default {
  delete: call("DELETE"),
  get: call("GET"),
  post: call("POST"),
  put: call("PUT"),
  patch: call("PATCH"),
};
