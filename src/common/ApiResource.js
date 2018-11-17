import axios from 'axios';

const API_PREFIX = '/api';

export default class ApiResource {

  constructor() {
  }

  getJson(url) {
    return this.getJsonWithParams(url, null);
  }

  getJsonWithParams(url, params) {
    let apiUrl = url;
    if (!url.startsWith(API_PREFIX)) {
      apiUrl = API_PREFIX + url;
    }

    let config = {
      headers: {'Accept': 'application/json'},
      paramsSerializer: function (params) {
        console.log('paramsSerializer params', params);
        //return Qs.stringify(params, {arrayFormat: 'brackets'})
        return '';
      },

    };

    if (params) {
      config.params = params;
    }

    return axios.get(apiUrl, config)
      .then(result => result.data);
  }

}
