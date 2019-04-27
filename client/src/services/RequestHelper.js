import StringUtils from '../utils/StringUtils'

class RequestHelper {
  get(endpoint, query = null) {
    return this.request('GET', endpoint, query)
  }

  post(endpoint, query = null) {
    return this.request('POST', endpoint, query)
  }

  async request(method, endpoint, query) {
    const url =
      method === 'GET' && query !== null
        ? StringUtils.format(endpoint, query)
        : endpoint

    const requestOptions = {
      method,
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }

    if (method === 'POST' && query !== null) {
      requestOptions.body = JSON.stringify(query)
    }

    try {
      const resp = await window.fetch(url, requestOptions)
      return resp.ok ? (method === 'GET' ? resp.json() : resp) : resp
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
export default RequestHelper
