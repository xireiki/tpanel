export class maho {
  #api = [
    "/api", // 0, get
    "/api/log", // 1, get
    "/api/log/details", // 2, get
    "/api/kernel", // 3, get/post
    "/api/subs/list/:id", // 4, get
    "/api/subs/list", // 5, get/patch
    "/api/subs", // 6, put
    "/api/subs/:id", // 7, delete
    "/api/subs/infos", // 8, get/post
    "/api/ctx/:id", // 9, get/put
    "/api/proxies", // 10, get
    "/api/maho", // 11, get/put/patch
    "/api/maho/labels", // 12, get
    "/api/maho/list", // 13, get
    "/api/maho/list/mode", // 14, patch
    "/api/maho/list/list", // 15, patch
    "/api/mode", // 16, patch
    "/api/box", // 17, get
    "/api/box/log", // 18, get/put
    "/api/box/ntp", // 19, get/put
    "/api/box/dns", // 20, get/patch
    "/api/box/dns/fakeip", // 21, get/put
    "/api/box/dns/servers", // 22, get/patch/put
    "/api/box/dns/servers/:id", // 23, get/delete
    "/api/box/dns/rules", // 24, get/patch
    "/api/box/inbounds", // 25, get/patch
    "/api/box/outbounds/:id", // 26, get/delete
    "/api/box/outbounds", // 27, get/put/patch
    "/api/box/route", // 28, get/patch
    "/api/box/route/rules", // 29, get
    "/api/box/exp", // 30, get
    "/api/box/exp/clash", // 31, get
    "/api/box/exp/clash/modes", // 32, get
    "/api/box/exp/v2ray", // 33, get
    "/api/box/config" // 34, put
  ]
  #API(id, {method = "GET", data = null, promise = true, apid = null, callback = undefined} = {}){
    const headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": this.auth
    });
    let apiPath = `http://${this.address}:${this.port}${this.#api[id]}`;
    if(apid){
      apiPath = apiPath.replace(/:id/, apid);
    }
    let req;
    if(method == "GET"){
      req = fetch(apiPath, {method: "GET", headers: headers});
    } else if(method == "POST"){
      if(data == null || data == undefined){
        req = fetch(apiPath, {method: "POST", headers: headers});
      } else {
        req = fetch(apiPath, {method: "POST", headers: headers, body: JSON.stringify(data)});
      }
    } else if(method == "PATCH"){
      if(data == null || data == undefined){
        req = fetch(apiPath, {method: "PATCH", headers: headers});
      } else {
        req = fetch(apiPath, {method: "PATCH", headers: headers, body: JSON.stringify(data)});
      }
    } else if(method == "PUT"){
      if(data == null || data == undefined){
        req = fetch(apiPath, {method: "PUT", headers: headers});
      } else {
        req = fetch(apiPath, {method: "PUT", headers: headers, body: JSON.stringify(data)});
      }
    } else if(method == "DELETE"){
      req = fetch(apiPath, {method: "DELETE", headers: headers});
    } else {
      req = fetch(apiPath, {method: "GET", headers: headers});
    }
    if(promise){
      return req;
    }
    req
    .then(response => response.text())
    .then(text => callback(undefined, text))
    .catch(err => {
      callback(err);
    });
  }
  constructor(auth = "node", address = "127.0.0.1", port = 23333) {
    this.auth = auth;
    this.address = address;
    this.port = port;
  }
  check(promise = true, callback = undefined){
    const req = fetch(`http://${this.address}:${this.port}${this.#api[0]}`, {method: "GET", headers: new Headers({
      "Content-Type": "application/json",
      "Authorization": this.auth
    })});
    if(promise){
      return new Promise((resolve, reject) => {
        req.then(r => {
          if(r.ok){
            resolve(true, r);
          } else {
            reject(false, r);
          }
        });
      });
    }
    req.then(r => {
      if(r.ok){
        callback(true, r);
      } else {
        callback(false, r);
      }
    });
  }
  log(promise = true, callback = undefined){
    return this.#API(1, {method: "GET", promise: promise, callback: callback});
  }
  logDetails(promise = true, callback = undefined){
    return this.#API(2, {method: "GET", promise: promise, callback: callback});
  }
  kernel(data = null, method = "GET", promise = true, callback = undefined){
    // GET/POST
    return this.#API(3, {method: method, data: data, promise: promise, callback: callback});
  }
  subsListId(id, promise = true, callback = undefined){
    return this.#API(4, {method: "GET", promise: promise, id, callback: callback});
  }
  subsList(data = null, method = "GET", promise = true, callback = undefined){
    // GET/PATCH
    return this.#API(5, {method: method, data: data, promise: promise, callback: callback});
  }
  subs(data = null, promise = true, callback = undefined){
    return this.#API(6, {method: "PUT", data: data, promise: promise, callback: callback});
  }
  subsId(id, promise = true, callback = undefined){
    return this.#API(7, {method: "DELETE", promise: promise, id, callback: callback});
  }
  subsInfos(data = null, method = "GET", promise = true, callback = undefined){
    // GET/POST
    return this.#API(8, {method: method, data: data, promise: promise, callback: callback});
  }
  ctxId(id, data = null, promise = true, method = "GET", callback = undefined){
    // GET/PUT
    return this.#API(9, {method: method, data: data, promise: promise, id, callback: callback});
  }
  proxies(promise = true, callback = undefined){
    return this.#API(10, {method: "GET", promise: promise, callback: callback});
  }
  maho(data = null, method = "GET", promise = true, callback = undefined){
    // GET/PATCH/PUT
    return this.#API(11, {method: method, data: data, promise: promise, callback: callback});
  }
  labels(promise = true, callback){
    return this.#API(12, {method: "GET", promise: promise, callback: callback});
  }
  list(promise = true, callback){
    return this.#API(13, {method: "GET", promise: promise, callback: callback});
  }
  listMode(data, promise = true, callback){
    return this.#API(14, {method: "PATCH", data: data, promise: promise, callback: callback});
  }
  listList(data, promise = true, callback){
    return this.#API(15, {method: "PATCH", data: data, promise: promise, callback: callback});
  }
  mode(data, promise = true, callback){
    return this.#API(16, {method: "PATCH", data: data, promise: promise, callback: callback});
  }
  box(promise = true, callback){
    // return: 喵
    return this.#API(17, {method: "GET", promise: promise, callback: callback});
  }
  boxLog(data = null, method = "GET", promise = true, callback){
    // GET/PUT
    return this.#API(18, {method: method, data: data, promise: promise, callback: callback});
  }
  boxNTP(data = null, method = "GET", promise = true, callback){
    // GET/PUT
    return this.#API(19, {method: method, data: data, promise: promise, callback: callback});
  }
  boxDNS(data = null, method = "GET", promise = true, callback){
    // GET/PATCH
    return this.#API(20, {method: method, data: data, promise: promise, callback: callback});
  }
  fakeip(data = null, method = "GET", promise = true, callback){
    // GET/PUT
    return this.#API(21, {method: method, data: data, promise: promise, callback: callback});
  }
  dns(data = null, method = "GET", promise = true, callback){
    // GET/PUT/PATCH
    return this.#API(22, {method: method, data: data, promise: promise, callback: callback});
  }
  dnsID(id, data = null, method = "GET", promise = true, callback){
    // GET/DELETE
    return this.#API(23, {method: method, data: data, promise: promise, id, callback: callback});
  }
  dnsRules(data = null, method = "GET", promise = true, callback){
    // GET/PATCH
    return this.#API(24, {method: method, data: data, promise: promise, callback: callback});
  }
  inbounds(data = null, method = "GET", promise = true, callback){
    // GET/PATCH
    return this.#API(25, {method: method, data: data, promise: promise, callback: callback});
  }
  outboundsID(id, data = null, method = "GET", promise = true, callback){
    // GET/DELETE
    return this.#API(26, {method: method, data: data, promise: promise, id, callback: callback});
  }
  outbounds(data = null, method = "GET", promise = true, callback){
    // GET/PUT/PATCH
    return this.#API(27, {method: method, data: data, promise: promise, callback: callback});
  }
  route(data = null, method = "GET", promise = true, callback){
    // GET/PATCH
    return this.#API(28, {method: method, data: data, promise: promise, callback: callback});
  }
  routeRules(promise = true, callback){
    return this.#API(29, {method: "GET", promise: promise, callback: callback});
  }
  exp(promise = true, callback){
    return this.#API(30, {method: "GET", promise: promise, callback: callback});
  }
  expClash(promise = true, callback){
    return this.#API(31, {method: "GET", promise: promise, callback: callback});
  }
  expClashModes(promise = true, callback){
    return this.#API(32, {method: "GET", promise: promise, callback: callback});
  }
  expV2ray(promise = true, callback){
    return this.#API(33, {method: "GET", promise: promise, callback: callback});
  }
  config(data = null, promise = true, callback){
    return this.#API(34, {method: "PUT", data: data, promise: promise, callback: callback});
  }
}

export class clash {
  #api = [
    /*
      ID: 0,
      METHOD: GET,
      RETURN: JSON
    */
    "/traffic",
    /*
      ID: 1,
      METHOD: GET,
      RETURN: JSON
    */
    "/logs",
    /*
      ID: 2,
      METHOD: GET,
      RETURN: JSON
    */
    "/proxies",
    /*
      ID: 3,
      METHOD: GET/PUT,
      RETURN: JSON
    */
    "/proxies/:name",
    /*
      ID: 4,
      METHOD: GET,
      RETURN: JSON
    */
    "/proxies/:name/delay",
    /*
      ID: 5,
      METHOD: GET/PATCH/PUT,
      RETURN: JSON
    */
    "/configs",
    /*
      ID: 6,
      METHOD: GET,
      RETURN: JSON
    */
    "/rules",
    /*
      ID: 7,
      METHOD: GET,
      RETURN: JSON
    */
    "/connections"
  ]
  #API(api, {promise = true, callback = null, data = null, type = "application/json", method = "GET", rep = null, reptext = ""} = {}){
    const headers = new Headers({
      "Content-Type": type,
      "Authorization": "Bearer " + this.secret
    });
    let apiPath = `http://${this.address}:${this.port}${this.#api[api]}`;
    if(rep){
      apiPath = apiPath.replace(rep, reptext);
    }
    let request;
    switch(method){
      case "GET":
        request = fetch(apiPath, {
          method: method,
          headers: headers
        });
        break;
      default:
        break;
    }
    if(promise){
      return request;
    }
    request.then(req => req.text())
    .then(text => callback(undefined, text))
    .catch(err => callback(err));
  }
  constructor(secret = "singBox", address = "127.0.0.1", port = 9909) {
    this.secret = secret;
    this.address = address;
    this.port = port;
    this.lastStatusTimes = 0;
  }
  connections(){
    return this.#API(7);
  }
}

export class v2ray {
  #api = []
  constructor(address = "127.0.0.1", port = 9909) {
    this.address = address;
    this.port = port;
  }
}