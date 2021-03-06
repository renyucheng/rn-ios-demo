'use strict'

module.exports = {
  header: {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  api: {
    base: 'http://rap.taobao.org/mockjs/7503/',
    creations: 'api/creations',
    up: 'api/up',
    signup: 'api/u/signup',
    verify: 'api/u/verify',
    sendLocation: 'api/driver/sendLocation',
  }
}