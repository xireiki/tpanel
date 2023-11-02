import { processTasks, SuperTask, runTask, makeWorker } from "./task.js";

class api {
  #api = {
    kernel: "/api/kernel", // GET, 获取运行状态; POST, 控制内核运行
    connections: "/connections", // GET
    subs: "/api/subs", // PUT, 新建、修改指定序号星盘
    subsInfos: "/api/subs/infos", // GET, 获取出站/星盘详情; PUT, 更新星盘
    subsList: "/api/subs/list", // GET, 获取星盘列表
    subsListNumber: "/api/subs/list/%d", // GET, 获取指定序号星盘详情，比如 /api/subs/list/0; DELETE, 删除指定序号星盘
    log: "/api/log", // GET, 获取日志更新时间戳
    logDetails: "/api/log/details", // GET, 获取日志详情
    boxLog: "/api/box/log", // GET, 获取 log 设置详情; PUT, 设置 log
    boxNtp: "/api/box/ntp", // GET, 获取 ntp 设置详情; PUT, 设置 ntp
    boxDnsServers: "/api/box/dns/servers", // GET, 获取 dns 服务器详情列表; PUT, 设置指定 dns 序号
    boxOutBounds: "/api/box/outbounds", // GET, 获取出站详情列表; PUT, 添加、修改出站
    boxOutBound: "/api/box/outbounds/%d", // GET, 获取指定序号出站详情列表; DELETE, 删除出站
    boxConfig: "/api/box/config", // PUT, 重装基础术士（重新读取 baseConfig, 以应用用户修改）
    maho: "/api/maho", // GET, 获取神秘面板设置; PATCH, 修改面板指定设置
    mode: "/api/mode" // PATCH, 更改分流模式, 请求参数 {"mode": "rule"}, {"mode": "direct"}, {"mode": "global"}
  }
  constructor(auth = "node", secret = "singBox", address = "127.0.0.1", mahoPort = 23333, apiPort = 9909) {
    this.auth = auth;
    this.secret = secret;
    this.address = address;
    this.mahoPort = mahoPort;
    this.apiPort = apiPort;
    this.lastStatusTimes = 0;
  }
  getApiUrl({name, number, hostname = this.address, port = this.apiPort, maho = false, scheme = "http"} = {}){
    let url = `${scheme}://`;
    if(maho) url += `${this.address}:${this.mahoPort}`;
    else url += `${hostname}:${port}`;
    if(name != undefined && this.#api.hasOwnProperty(name)) url += this.#api[name];
    else url = "";
    return url;
  }
  getKernel(callback){
    fetch(`http://${this.address}:${this.mahoPort}${this.#api.kernel}`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => {
      this.status = json.status;
      if(this.lastStatus == undefined || this.status != this.lastStatus){
        if(this.lastStatusTimes >= 5){
          this.lastStatus = json.status;
          this.lastStatusTimes = 0;
        }
        this.lastStatusTimes += 1;
      }
      if(this.lastStatus == this.status && this.lastStatusTimes != 0) this.lastStatusTimes = 0;
      this.secret = json.secret;
      callback(undefined, json)
    })
    .catch(err => {
      // logging.error(err)
      callback(err);
    });
  }
  postKernel(action, callback){
    fetch(`http://${this.address}:${this.mahoPort}${this.#api.kernel}`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      }),
      body: JSON.stringify({method:action})
    })
    .then(response => response.text())
    .then(text => callback(undefined, text))
    .catch(err => {
      // logging.error(err)
      callback(err);
    });
  }
  resKernel(method = "GET"){
    return fetch(`http://${this.address}:${this.mahoPort}${this.#api.kernel}`, {
      method: method,
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    });
  }
  getConnections(callback){
    if(this.lastStatus != "working"){
      if(this.status == "working") callback("Not Running: SingBox is not running", undefined, this);
      else callback("Not Running: SingBox is not running");
      return;
    } else if(this.lastStatus == "working" && this.status != "working"){
      callback("Stopping: SingBox is " + this.status, undefined, this);
      return;
    }
    fetch(`http://${this.address}:${this.apiPort}${this.#api.connections}`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.secret}`
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json, this))
    .catch(err => {
      // logging.error(err)
      callback(err, undefined, this);
    });
  }
  getSubsInfos(callback){
    fetch(`http://${this.address}:${this.mahoPort}${this.#api.subsInfos}`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json))
    .catch(err => {
      // logging.error(err)
      callback(err);
    });
  }
  setSubsInfos(name, callback){
    fetch(`http://${this.address}:${this.mahoPort}${this.#api.subsInfos}`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      }),
      body: JSON.stringify({name: name})
    })
    .then(response => response.text())
    .then(text => callback(undefined, text))
    .catch(err => {
      // logging.error(err)
      callback(err);
    });
  }
  getLog(callback){
    fetch(`http://${this.address}:${this.mahoPort}${this.#api.log}`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.text())
    .then(text => callback(undefined, text))
    .catch(err => {
      // logging.error(err)
      callback(err);
    });
  }
  getLogDetail(callback){
    fetch(`http://${this.address}:${this.mahoPort}${this.#api.logDetails}`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json))
    .catch(err => {
      // logging.error(err)
      callback(err);
    });
  }
  getSubsList(callback){
    fetch(this.getApiUrl({name: "subsList", maho: true}), {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json))
    .catch(err => {
      callback(err);
    });
  }
  getOutBounds(callback){
    fetch(this.getApiUrl({name: "boxOutBounds", maho: true}), {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json))
    .catch(err => {
      callback(err);
    });
  }
  getMaho(callback){
    fetch(this.getApiUrl({name: "maho", maho: true}), {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json))
    .catch(err => {
      callback(err);
    });
  }
  patchMaho(body, callback){
    fetch(this.getApiUrl({name: "maho", maho: true}), {
      method: "PATCH",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      }),
      body: JSON.stringify(body)
    })
    .then(response => callback(undefined, response))
    .catch(err => {
      callback(err);
    });
  }
  putMaho(callback){
    fetch(this.getApiUrl({name: "maho", maho: true}), {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => callback(undefined, response))
    .catch(err => {
      callback(err);
    });
  }
  patchMode(body, callback){
    fetch(this.getApiUrl({name: "mode", maho: true}), {
      method: "PATCH",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      }),
      body: JSON.stringify(body)
    })
    .then(response => callback(undefined, response))
    .catch(err => {
      callback(err);
    });
  }
  putBoxConfig(callback){
    fetch(this.getApiUrl({name: "boxConfig", maho: true}), {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => callback(undefined, response))
    .catch(err => {
      callback(err);
    });
  }
  getBoxNtp(callback){
    fetch(this.getApiUrl({name: "boxNtp", maho: true}), {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json))
    .catch(err => {
      callback(err);
    });
  }
  putBoxNtp(body, callback){
    fetch(this.getApiUrl({name: "boxNtp", maho: true}), {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      }),
      body: JSON.stringify(body)
    })
    .then(response => callback(undefined, response))
    .catch(err => {
      callback(err);
    });
  }
  getBoxLog(callback){
    fetch(this.getApiUrl({name: "boxLog", maho: true}), {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json))
    .catch(err => {
      callback(err);
    });
  }
  putBoxLog(body, callback){
    fetch(this.getApiUrl({name: "boxLog", maho: true}), {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      }),
      body: JSON.stringify(body)
    })
    .then(response => callback(undefined, response))
    .catch(err => {
      callback(err);
    });
  }
  getSubsList(callback){
    fetch(this.getApiUrl({name: "subsList", maho: true}), {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": this.auth
      })
    })
    .then(response => response.json())
    .then(json => callback(undefined, json))
    .catch(err => {
      callback(err);
    });
  }
}

const doc = {
  createElement: function(tagName) {
    return new Promise(resolve => {
      const element = document.createElement(tagName);
      resolve(element);
    });
  },
  getElement: function(select, context){
    return new Promise(resolve => {
      context = context || document;
      const element = context.querySelectorAll(select);
      if(element.length == 1){
        resolve(Array.prototype.slice.call(element)[0]);
      } else {
        resolve(Array.prototype.slice.call(element));
      }
    });
  },
  query: function(select, context){
    context = context || document;
    const element = context.querySelectorAll(select);
    if(element.length == 1){
      return Array.prototype.slice.call(element)[0];
    }
    return Array.prototype.slice.call(element);
  },
  jsonp: function jsonp(url, callback) {
    const fnName = 'jsonpCallback_' + Math.round(100000 * Math.random());
    window[fnName] = function(data) {
      callback(data);
      delete window[fnName];
    }
    const fullUrl = `${url}?callback=${fnName}`;
    const script = document.createElement('script');
    script.src = fullUrl;
    document.body.appendChild(script);
  }
}

const logging = {
  info: function(...args){
    console.info(...args);
  },
  warn: function(...args){
    console.warn(...args);
  },
  error: function(...args){
    console.error(...args);
  }
}

function generateThumbnails(imageFile) {
  return new Promise((resolve, reject) => {
    createImageBitmap(imageFile).then(imageBitmap => {
      const canvas = document.createElement('canvas')
      canvas.width = imageBitmap.height > 1000 ? (imageBitmap.height / 4) : (imageBitmap.height / 2)
      canvas.height = imageBitmap.width > 1000 ? (imageBitmap.width / 4) : (imageBitmap.width / 2)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height)
      const url = canvas.toDataURL('image/jpeg')
      // console.log('缩略图')
      // console.log('%c  ', 'background:url(' + url + ') no-repeat ;line-height:' + canvas.height + 'px;font-size:' + canvas.height + 'px')
      if (url.length > 80 * 1024) {
        generateThumbnails(convertBase64UrlToBlob(url)).then(res => {
          resolve(res)
        })
      } else {
        resolve(url)
      }
    }).catch((err) => {
      reject('缩略图生成失败：' + err)
    })
  })
}

function convertBase64UrlToBlob(base64) {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const str = atob(arr[1])
  let n = str.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = str.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

function getBase64ImageUrl(url, callBack, imgType) {
  if(!imgType){
    imgType = "image/png";
  }
  let img = new Image(); 
  img.src= url;
  img.crossOrigin = "anonymous";
  img.onload = function(){
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");  
    ctx.drawImage(img, 0, 0);
    let dataURL = canvas.toDataURL(imgType);
    callBack(dataURL);
  }
}

function getColors(image) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const colors = [];
    for(let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1]; 
      const blue = data[i + 2];
      colors.push([red, green, blue]);
    }
    const sortedColors = colors.sort((a, b) => 
      colors.filter(v => v===a).length - colors.filter(v => v===b).length
    );
    const mostFrequentColor = sortedColors[sortedColors.length - 1];
    resolve('rgb(' + mostFrequentColor.join(',') + ')');
  });
}

function getDominantColor(){
  return new Promise(resolve => {
    getBase64ImageUrl("/images/bg.png", dataUrl => {
      generateThumbnails(convertBase64UrlToBlob(dataUrl))
      .then(img => {
        doc.createElement("img")
        .then(i => {
          i.src = img;
          i.style.display = "none";
          i.onload = function(){
            getColors(i).then(color => {
              // window.bgDominantColor = color;
              resolve(color);
              i.remove();
            });
          }
          document.body.append(i);
        })
      })
      .catch(err => logging.error(err));
    });
  });
}

function generationLog(log){
  return new Promise(resolve => {
    doc.createElement("p")
    .then(p => {
      p.id = "log_" + log.id.split("-").join("");
      let logTime = log.time;
      let logType = log.level;
      let logText = log.content;
      doc.createElement("span")
      .then(span => {
        span.classList.add("logSpace");
        switch(logType){
          case "info":
            span.innerText = "INFO";
            span.classList.add("infoLog");
            break;
          case "warn":
            span.innerText = "WARN";
            span.classList.add("warnLog");
            break;
          case " err":
            span.innerText = "ERRO";
            span.classList.add("errLog");
            break;
          default:
            break;
        }
        p.append("[" + logTime + "]", span, logText);
      });
      resolve(p);
    });
  });
}

function toMemory(memory){
  if(memory < 1024)
    return memory.toFixed(2) + "B";
  else if(memory < 1048576)
    return (memory / 1024).toFixed(2) + "KB";
  else if(memory < 1073741824)
    return (memory / 1048576).toFixed(2) + "MB";
  else if(memory < 1099511627776)
    return (memory / 1073741824).toFixed(2) + "GB";
  else if(memory < 1125899906842624)
    return (memory / 1099511627776).toFixed(2) + "TB";
  else if(memory < 1152921504606846976)
    return (memory / 1125899906842624).toFixed(2) + "PB";
  else
    return (memory / 1152921504606846976).toFixed(2) + "EB";
}

function config(key, value){
  if(value != undefined && key != undefined){
    let tmpObj = JSON.parse(localStorage.getItem("mystery") || "{}");
    tmpObj[key] = value;
    return localStorage.setItem("mystery", JSON.stringify(tmpObj));
  } else if(key != undefined){
    return JSON.parse(localStorage.getItem("mystery") || '{}')[key];
  } else {
    return JSON.parse(localStorage.getItem("mystery") || '{}');
  }
}

function general(e){
  if(document.getElementById("general")) return;
  // 通用盒子
  doc.createElement("div")
  .then(div => {
    div.id = "general";
    div.classList.add("settingBox");
    // 通用标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "通用";
      p.addEventListener("click", (event) => {
        div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
        setTimeout(() => {
          div.remove();
          window.childPage = false;
        }, 100);
      });
      div.append(p);
    });
    let toggleOptionList = [
      {
        id: "shortly",
        key: "shortly",
        name: "设置立即生效",
        action: function(event, selfObj){
          config(selfObj.key, event.target.checked);
        }
      },
      {
        id: "speed",
        key: "speed",
        target: "#speed",
        name: "在主页显示速率",
        action: function(event, selfObj){
          config(selfObj.key, event.target.checked);
          if(config("shortly")){
            doc.query(selfObj.target).style.display =  event.target.checked ? null : "none";
          }
        }
      },
      {
        id: "log",
        key: "log",
        target: "#log",
        name: "在主页显示日志",
        action: function(event, selfObj){
          config(selfObj.key, event.target.checked);
          if(config("shortly")){
            doc.query(selfObj.target).style.display =  event.target.checked ? null : "none";
          }
        }
      },
      {
        id: "yiyan",
        key: "YiYan",
        target: "#jinrishici-sentence",
        name: "启用一言",
        action: function(event, selfObj){
          config(selfObj.key, event.target.checked);
          if(config("shortly")){
            doc.query(selfObj.target).style.display =  event.target.checked ? null : "none";
          }
        }
      },
      {
        id: "subsOrder",
        key: "subsOrder",
        name: "订阅栏长按修改顺序",
        disabled: true,
        action: function(event, selfObj){
          setTimeout(event => {
            doc.query("#" + selfObj.id + "Checked").checked = false;
          }, 1000);
          // config(selfObj.key, event.target.checked);
          if(config("shortly")){
            // 逻辑
          }
        }
      },
      {
        id: "functionControl",
        key: "function",
        name: "主页功能中心",
        disabled: true,
        action: function(event, selfObj){
          setTimeout(event => {
            doc.query("#" + selfObj.id + "Checked").checked = false;
          }, 1000);
          // config(selfObj.key, event.target.checked);
          if(config("shortly")){
            // 逻辑
          }
        }
      }
    ];
    for(let o of toggleOptionList){
      doc.createElement("div")
      .then(option => {
        doc.createElement("p")
        .then(p => {
          p.classList.add("settingName")
          p.innerText = o.name;
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = o.id + "Checked"
            input.type = "checkbox";
            input.checked = config(o.key) ? true : false;
            if(o.disabled) input.disabled = true;
            input.addEventListener("change", event => o.action(event, o));
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = o.id + "Checked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
    }
    document.body.append(div);
  });
}

function subscribeOption(e){
  if(document.getElementById("subscribe")) return;
  // 盒子
  doc.createElement("div")
  .then(div => {
    div.id = "subscribe";
    div.classList.add("settingListBox");
    // 标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "订阅";
      p.addEventListener("click", (event) => {
        div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
        setTimeout(() => {
          div.remove();
          window.childPage = false;
        }, 100);
      });
      div.append(p);
    });
    xixo.getSubsList((err, json) => {
      doc.createElement("div").then(allsub => {
        allsub.classList.add("allsub");
        for(let s of json){
          doc.createElement("div")
          .then(everysub => {
            everysub.classList.add("everysub");
            doc.createElement("p").then(p => {
              p.innerText = s.name;
              everysub.append(p);
            });
            doc.createElement("p").then(p => {
              p.innerText = s.type == "http" ? "机场订阅" : "本地配置";
              everysub.append(p);
            });
            doc.createElement("p").then(p => {
              p.innerText = s.enabled == undefined ? "已启用" : s.enabled ? "已启用" : "已停用";
              everysub.append(p);
            });
            allsub.append(everysub);
          });
        }
        div.append(allsub);
      });
    });
    document.body.append(div);
  });
}

function outboundsOption(e){
  if(document.getElementById("outbounds")) return;
  // 盒子
  doc.createElement("div")
  .then(div => {
    div.id = "outbounds";
    div.classList.add("settingBox");
    // 标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "出站";
      p.addEventListener("click", (event) => {
        div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
        setTimeout(() => {
          div.remove();
          window.childPage = false;
        }, 100);
      });
      div.append(p);
    });
    
    document.body.append(div);
  });
}

function dnsServerOption(e){
  if(document.getElementById("dnsServer")) return;
  // 盒子
  doc.createElement("div")
  .then(div => {
    div.id = "dnsServer";
    div.classList.add("settingBox");
    // 标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "DNS";
      p.addEventListener("click", (event) => {
        div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
        setTimeout(() => {
          div.remove();
          window.childPage = false;
        }, 100);
      });
      div.append(p);
    });
    
    document.body.append(div);
  });
}

function mystery(e){
  if(document.getElementById("settingBox")) return;
  xixo.getMaho((err,  json) => {
    if(err){
      json = {};
      alert("连接错误: ", err);
    }
    doc.createElement("div")
    .then(div => {
      div.id = "settingBox";
      div.classList.add("settingBox");
      doc.createElement("p")
      .then(p => {
        p.innerText = "神秘";
        p.addEventListener("click", (event) => {
          div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
          setTimeout(() => {
            div.remove();
            window.childPage = false;
          }, 100);
        });
        div.append(p);
      });
      if(json.platform == "android"){
        doc.createElement("div")
        .then(option => {
          option.id = "apModeBox"; // 热点模式
          doc.createElement("p")
          .then(p => {
            p.id = "apModeName";
            p.classList.add("settingName")
            p.innerText = "热点模式";
            option.append(p);
          });
          doc.createElement("div")
          .then(labelBox => {
            labelBox.id = "apModeToggle";
            doc.createElement("input")
            .then(input => {
              input.id = "apModeChecked"
              input.type = "checkbox";
              input.checked = json.apMode.enabled;
              input.addEventListener("change", (event) => {
                // 热点模式设置逻辑
                let lastChecked = input.checked;
                xixo.patchMaho({
                  "apMode.enabled": input.checked
                }, (err, response) => {
                  if(err || !response.ok) setTimeout(() => {
                    input.checked = lastChecked;
                  }, 500);
                  if(!response.ok){
                    setTimeout(() => input.checked = lastChecked, 500);
                  }
                });
              });
              input.setAttribute("style", "width: 0; height: 0;");
              labelBox.append(input);
            });
            doc.createElement("label")
            .then(label => {
              label.htmlFor = "apModeChecked";
              label.classList.add("toggle");
              labelBox.append(label);
            });
            option.append(labelBox);
          });
          div.append(option)
        });
        doc.createElement("div")
        .then(option => {
          option.id = "compatibilityModeBox"; // 兼容模式
          doc.createElement("p")
          .then(p => {
            p.id = "compatibilityModeName";
            p.classList.add("settingName")
            p.innerText = "兼容模式";
            option.append(p);
          });
          doc.createElement("div")
          .then(labelBox => {
            labelBox.id = "compatibilityModeToggle";
            doc.createElement("input")
            .then(input => {
              input.id = "compatibilityModeChecked"
              input.type = "checkbox";
              input.checked = json.apMode.compatibilityMode;
              input.addEventListener("change", (event) => {
                // 兼容模式设置逻辑
                let lastChecked = input.checked;
                xixo.patchMaho({
                  "apMode.compatibilityMode": input.checked
                }, (err, response) => {
                  if(err || !response.ok) setTimeout(() => input.checked = lastChecked, 500);
                });
              });
              input.setAttribute("style", "width: 0; height: 0;");
              labelBox.append(input);
            });
            doc.createElement("label")
            .then(label => {
              label.htmlFor = "compatibilityModeChecked";
              label.classList.add("toggle");
              labelBox.append(label);
            });
            option.append(labelBox);
          });
          div.append(option)
        });
      }
      doc.createElement("div")
      .then(option => {
        option.id = "bindHost"; // 绑定地址
        doc.createElement("p")
        .then(p => {
          p.id = "bindHostName";
          p.classList.add("settingName")
          p.innerText = "全局访问";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = "bindHostChecked"
            input.type = "checkbox";
            input.checked = json.bindHost == "127.0.0.1" ? false : true;
            input.addEventListener("change", (event) => {
              // 全局访问
              let lastValue = input.checked;
              xixo.patchMaho({
                "bindHost": input.checked ? "0.0.0.0" : "127.0.0.1"
              }, (err, response) => {
                if(err || !response.ok) setTimeout(() => input.checked = lastValue, 500);
              });
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "bindHostChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "startWithSingBox"; // 核心开机自启
        doc.createElement("p")
        .then(p => {
          p.id = "startWithSingBoxName";
          p.classList.add("settingName")
          p.innerText = "核心开机自启";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          labelBox.id = "startWithSingBoxToggle";
          doc.createElement("input")
          .then(input => {
            input.id = "startWithSingBoxChecked"
            input.type = "checkbox";
            input.checked = json.startWithSingBox;
            input.addEventListener("change", (event) => {
              // 开机自启设置逻辑
              let lastValue = input.checked;
              xixo.patchMaho({
                "startWithSingBox": input.checked
              }, (err, response) => {
                if(err || !response.ok) setTimeout(() => input.checked = lastValue, 500);
              });
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "startWithSingBoxChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "autoDownSub"; // 自动更新订阅
        doc.createElement("p")
        .then(p => {
          p.id = "autoDownSubName";
          p.classList.add("settingName")
          p.innerText = "自动更新订阅";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          labelBox.id = "autoDownSubToggle";
          doc.createElement("input")
          .then(input => {
            input.id = "autoDownSubChecked"
            input.type = "checkbox";
            input.checked = json.autoDownSub;
            input.addEventListener("change", (event) => {
              // 自动更新订阅设置逻辑
              let lastValue = input.checked;
              xixo.patchMaho({
                "autoDownSub": input.checked
              }, (err, response) => {
                if(err || !response.ok) setTimeout(() => input.checked = lastValue, 500);
              });
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "autoDownSubChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "autoDownGeo"; // 自动更新 Geo 数据库
        doc.createElement("p")
        .then(p => {
          p.id = "autoDownGeoName";
          p.classList.add("settingName")
          p.innerText = "自动更新地理数据库";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          labelBox.id = "autoDownGeoToggle";
          doc.createElement("input")
          .then(input => {
            input.id = "autoDownGeoChecked"
            input.type = "checkbox";
            input.checked = json.autoDownGeo.enabled;
            input.addEventListener("change", (event) => {
              // 自动更新 Geo 数据库设置逻辑
              let lastValue = input.checked;
              xixo.patchMaho({
                "autoDownGeo.enabled": input.checked
              }, (err, response) => {
                if(err || !response.ok) setTimeout(() => input.checked = lastValue, 500);
              });
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "autoDownGeoChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "immediateProtect"; // 自动更新订阅
        doc.createElement("p")
        .then(p => {
          p.classList.add("settingName")
          p.innerText = "核心启动立即守护";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = "immediateProtectChecked"
            input.type = "checkbox";
            input.checked = json.immediateProtect;
            input.addEventListener("change", (event) => {
              // 自动更新订阅设置逻辑
              let lastValue = input.checked;
              xixo.patchMaho({
                "immediateProtect": input.checked
              }, (err, response) => {
                if(err || !response.ok) setTimeout(() => input.checked = lastValue, 500);
              });
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "immediateProtectChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "mode"; // 代理分流模式
        doc.createElement("p")
        .then(p => {
          p.id = "modeName";
          p.classList.add("settingName")
          p.innerText = "代理连接模式";
          option.append(p);
        });
        doc.createElement("div")
        .then(modeForm => {
          modeForm.id = "modeForm"; // 
          modeForm.classList.add("modeForm");
          doc.createElement("select")
          .then(select => {
            select.addEventListener("change", event => {
              // 代理分流模式设置逻辑
              let lastValue = select.value;
              xixo.patchMode({
                "mode": select.value
              }, (err, response) => {
                if(err || !response.ok) setTimeout(() => select.value = lastValue, 500);
              });
            });
            doc.createElement("option")
            .then(option2 => {
              option2.innerText = "全局"
              option2.value = "global";
              if(json.mode == "global") option2.selected = true;
              select.append(option2);
            });
            doc.createElement("option")
            .then(option2 => {
              option2.innerText = "规则"
              option2.value = "rule";
              if(json.mode == "rule") option2.selected = true;
              select.append(option2);
            });
            doc.createElement("option")
            .then(option2 => {
              option2.innerText = "直连"
              option2.value = "direct";
              if(json.mode == "direct") option2.selected = true;
              select.append(option2);
            });
            modeForm.append(select);
          });
          option.append(modeForm);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "authorizationKey"; // 授权码
        doc.createElement("p")
        .then(p => {
          p.id = "authorizationKeyName";
          p.classList.add("settingName");
          p.innerText = "后端授权码";
          option.append(p);
        });
        doc.createElement("div")
        .then(auth => {
          auth.id = "authorizationKeyBox";
          doc.createElement("input")
          .then(input => {
            input.id = "authorizationKeyInput";
            input.type = "text";
            input.value = json.authorizationKey;
            input.addEventListener("keypress", event => {
              // 授权码更新逻辑
              let lastValue = input.value;
              xixo.patchMaho({
                "authorizationKey": input.value
              }, (err, response) => {
                if(err || !response.ok) setTimeout(() => input.value = lastValue, 500);
                localStorage.auth = input.value;
                window.xixo = new api(localStorage.auth);
              });
            });
            auth.append(input);
          });
          option.append(auth);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "boxConfig";
        doc.createElement("p")
        .then(p => {
          p.id = "boxConfigName";
          p.classList.add("settingName");
          p.innerText = "重载配置响应修改";
          option.append(p);
        });
        doc.createElement("div")
        .then(func => {
          func.id = "boxConfigBox";
          doc.createElement("button")
          .then(button => {
            button.id = "boxConfigButton";
            button.type = "button";
            button.innerText = "重载";
            button.addEventListener("click", event => {
              // 重载基础术式逻辑
              xixo.putBoxConfig((err, response) => {
                if(err) alert("重载基础术式失败: 无法连接到神秘后端"); 
                if(!response.ok) alert("重载基础术式失败: " + response.status + ", 请刷新网页重试");
              });
            });
            func.append(button);
          });
          option.append(func);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "createConfig";
        doc.createElement("p")
        .then(p => {
          p.id = "createConfigName";
          p.classList.add("settingName");
          p.innerText = "生成分享配置";
          option.append(p);
        });
        doc.createElement("div")
        .then(func => {
          func.id = "createConfigBox";
          doc.createElement("button")
          .then(button => {
            button.id = "createConfigButton";
            button.type = "button";
            button.innerText = "生成";
            button.addEventListener("click", event => {
              // 生成兼容配置逻辑
              xixo.putMaho((err, response) => {
                if(err) alert("生成分享配置失败: 无法连接到神秘后端"); 
                if(!response.ok) alert("生成分享配置失败: " + response.status + ", 请刷新网页重试");
              });
            });
            func.append(button);
          });
          option.append(func);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "ipv6"; // 开启IPv6
        doc.createElement("p")
        .then(p => {
          p.id = "ipv6Name";
          p.classList.add("settingName")
          p.innerText = "开启IPv6";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = "ipv6Checked"
            input.type = "checkbox";
            input.checked = json.ipv6;
            input.addEventListener("change", (event) => {
              // 全局访问
              let lastValue = input.checked;
              xixo.patchMaho({
                "ipv6": input.checked
              }, (err, response) => {
                if(err || !response.ok) setTimeout(() => input.checked = lastValue, 500);
              });
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "ipv6Checked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
      doc.query("body").append(div);
    });
  });
}

function ntpOption(e){
  if(document.getElementById("general")) return;
  // 盒子
  doc.createElement("div")
  .then(div => {
    div.id = "ntpOption";
    div.classList.add("settingBox");
    // 标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "NTP";
      p.addEventListener("click", (event) => {
        div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
        setTimeout(() => {
          div.remove();
          window.childPage = false;
        }, 100);
      });
      div.append(p);
    });
    xixo.getBoxNtp((err, json) => {
      if(err){
        alert("无法连接到神秘后端!请刷新网页重试!");
        return
      };
      doc.createElement("div")
      .then(option => {
        doc.createElement("p")
        .then(p => {
          p.classList.add("settingName")
          p.innerText = "开启";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = "ntpChecked"
            input.type = "checkbox";
            input.checked = json.enabled ? true : false;
            input.addEventListener("change", event => {
              json.enabled = event.target.checked;
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "ntpChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option);
      });
      let ntpOptions = [
        {
          id: "serverOption",
          name: "服务器地址",
          value: json.server == undefined ? "" : json.server,
          input: function(event){
            json.server = event.target.value;
          },
          action: function(event, selfObj){
            json.server = event.target.value;
          }
        },
        {
          id: "serverPortOption",
          name: "服务器端口",
          type: "number",
          pattern: "\d+",
          value: json.server_port == undefined ? "" : json.server_port,
          input: function(event){
            event.target.value = event.target.value.replace(/[\+\-e\.]+/g, "");
            let port = Number(event.target.value);
            if(event.target.value == ""){
              port = undefined;
              event.target.value = "";
            } else if(port < 1){
              port = 1;
              event.target.value = "1"
            } else if(port > 65535){
              port = 65535;
              event.target.value = "65535";
            }
            json.server_port = port;
          },
          action: function(event, selfObj){
            json.server_port = event.target.value;
          }
        },
        {
          id: "ntpCalibrationIntervalOption",
          name: "时间校准间隔",
          pattern: "[smh0-9]+",
          value: json.interval == undefined ? "" : json.interval,
          input: function(event){
            event.target.value = event.target.value.replace(/[^0-9smh]/, "");
            let duration = event.target.value.match(/^\d+[smh]/);
            if(duration instanceof Array){
              duration = duration[0];
            }
            json.interval = duration ? duration : undefined;
          },
          action: function(event, selfObj){
            json.interval = event.target.value;
          }
        }
      ]
      for(let o of ntpOptions){
        doc.createElement("div")
        .then(option => {
          doc.createElement("p")
          .then(p => {
            p.classList.add("settingName");
            p.classList.add("settingNameInput");
            p.innerText = o.name;
            option.append(p);
          });
          doc.createElement("div")
          .then(ntp => {
            ntp.id = o.id + "Box";
            ntp.classList.add("settingInputBox");
            doc.createElement("input")
            .then(input => {
              input.id = o.id + "Input";
              input.type = o.type ? o.type : "text";
              if(o.pattern) input.pattern = o.pattern;
              input.value = o.value;
              if(o.placeholder) input.placeholder = o.placeholder;
              if(o.input) input.addEventListener("input", o.input);
              input.addEventListener("keypress", event => o.action(event, o));
              ntp.append(input);
            });
            option.append(ntp);
          });
          div.append(option)
        });
      }
      doc.createElement("button")
      .then(button => {
        button.id = "submit";
        button.innerText = "提交";
        button.addEventListener("click", event => {
          xixo.putBoxNtp(json, (err, response) => {
            if(err) alert("无法连接到神秘后端!");
            if(!response.ok){
              alert("修改失败，请刷新重试");
            }
          })
        });
        div.append(button);
      });
    });
    document.body.append(div);
  });
}

function logOption(e){
  if(document.getElementById("general")) return;
  // 盒子
  doc.createElement("div")
  .then(div => {
    div.id = "logOption";
    div.classList.add("settingBox");
    // 标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "日志";
      p.addEventListener("click", (event) => {
        div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
        setTimeout(() => {
          div.remove();
          window.childPage = false;
        }, 100);
      });
      div.append(p);
    });
    xixo.getBoxLog((err, json) => {
      if(err){
        alert("无法连接到神秘后端，请刷新网页重试！");
        return;
      }
      doc.createElement("div")
      .then(option => {
        doc.createElement("p")
        .then(p => {
          p.classList.add("settingName")
          p.innerText = "开启";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = "logChecked"
            input.type = "checkbox";
            input.checked = json.disabled ? false : true;
            input.addEventListener("change", event => {
              json.disabled = event.target.checked ? false : true;
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "logChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option);
      });
      doc.createElement("div")
      .then(option => {
        option.id = "level"; // 日志等级
        doc.createElement("p")
        .then(p => {
          p.id = "levelName";
          p.classList.add("settingName")
          p.innerText = "日志等级";
          option.append(p);
        });
        doc.createElement("div")
        .then(levelForm => {
          levelForm.id = "levelForm"; // 
          levelForm.classList.add("modeForm");
          doc.createElement("select")
          .then(select => {
            select.addEventListener("change", event => {
              json.level = select.value;
            });
            for(let o of [{type:"trace"},{type:"debug"},{type:"info"},{type:"warn"},{type:"error"},{type:"fatal"},{type:"panic"}]){
              doc.createElement("option")
              .then(option2 => {
                option2.innerText = o.type
                option2.value = o.type;
                if(json.level == o.type) option2.selected = true;
                select.append(option2);
              });
            }
            levelForm.append(select);
          });
          option.append(levelForm);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        option.id = "output";
        doc.createElement("p")
        .then(p => {
          p.id = "outputName";
          p.classList.add("settingName");
          p.classList.add("settingNameInput");
          p.innerText = "log 保存地址";
          option.append(p);
        });
        doc.createElement("div")
        .then(output => {
          output.id = "outputBox";
          output.classList.add("settingInputBox");
          doc.createElement("input")
          .then(input => {
            input.id = "outputInput";
            input.type = "text";
            input.value = json.output;
            input.addEventListener("input", event => {
              json.output = input.value;
            });
            output.append(input);
          });
          option.append(output);
        });
        div.append(option)
      });
      doc.createElement("div")
      .then(option => {
        doc.createElement("p")
        .then(p => {
          p.classList.add("settingName")
          p.innerText = "日志输出带时间";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = "timestampChecked"
            input.type = "checkbox";
            input.checked = json.timestamp ? true : false;
            input.addEventListener("change", event => {
              json.timestamp = event.target.checked ? true : false;
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "timestampChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option);
      });
      doc.createElement("button")
      .then(button => {
        button.id = "submit";
        button.innerText = "提交";
        button.addEventListener("click", event => {
          xixo.putBoxLog(json, (err, response) => {
            if(err) alert("无法连接到神秘后端!");
            if(!response.ok){
              alert("修改失败，请刷新重试");
            }
          });
        });
        div.append(button);
      });
    });
    document.body.append(div);
  });
}

// function xxxOption(e){
  // if(document.getElementById("")) return;
  // // 盒子
  // doc.createElement("div")
  // .then(div => {
    // div.id = "";
    // div.classList.add("settingBox");
    // // 标题
    // doc.createElement("p")
    // .then(p => {
      // p.innerText = "";
      // p.addEventListener("click", (event) => {
        // div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
        // setTimeout(() => {
          // div.remove();
          // window.childPage = false;
        // }, 100);
      // });
      // div.append(p);
    // });
    // ... 代码
    // document.body.append(div);
  // });
// }

function optionPage(o, e){
  window.childPage = true;
  switch(o){
    case 1:
      general(e);
      break;
    case 2:
      mystery(e);
      break;
    case 3:
      subscribeOption(e);
      break;
    case 4:
      outboundsOption(e);
      break;
    case 5:
      dnsServerOption(e);
      break;
    case 6:
      ntpOption(e);
      break;
    case 7:
      logOption(e);
      break;
    default:
      window.childPage = false;
      break;
  }
}

function setting(){
  if(document.getElementById("setting")){
    return;
  }
  document.body.classList.add("no-scroll");
  let options = [
    {
      id: 1,
      name: "通用",
      description: "本面板的设置。快点我！"
    },
    {
      id: 2,
      name: "神秘",
      description: "神秘啊神秘~启动！"
    },
    {
      id: 3,
      name: "订阅",
      description: "订阅列表，你有几个机场？",
      extra: function(description){
        xixo.getSubsList((err, json) => {
          if(err) description.innerText += "你能告诉我吗？";
          if(json.length == 0) description.innerText += "啥玩意儿？你一个机场都没？！";
          else if(json.length <= 3) description.innerText += `咦~你怎么才${json.length}个机场啊！`;
          else if(json.length > 3 && json.length <= 10) description.innerText += `你有${json.length}个机场。`;
          else description.innerText += `哇！！你居然有${json.length}个机场！`;
        });
      }
    },
    {
      id: 4,
      name: "出站",
      description: "订阅分组？传送阵！喵",
      extra: function(description){
        xixo.getOutBounds((err, json) => {
          if(err) description.innerText += "~";
          if(json.length == 0) description.innerText += "~ 你怎么一个传送阵都没呀？ 喵~";
          else if(json.length < 3) description.innerText += "~ 要坏掉了！ 喵"
          else if(json.length == 3) description.innerText += "~ 你是小白吗？居然只有1个新建的传送阵！ 喵";
          else if(json.length > 3 && json.length <= 10) description.innerText += "~ 是正常的！ 喵~";
          else description.innerText += "~ 你要这么多出站干什么呀？ 喵~";
        });
      }
    },
    {
      id: 5,
      name: "DNS",
      description: "书灵身上一定有墨香！因为“腹有诗书气自华”。"
    },
    {
      id: 6,
      name: "NTP",
      description: "NTP 时间服务器，用于校准时间。"
    },
    {
      id: 7,
      name: "日志",
      description: "获取神秘日志，聆听神秘之音，奏响神秘乐章！"
    }
  ]
  doc.createElement("div")
  .then(Mask => {
    Mask.classList.add("Mask");
    doc.createElement("div")
    .then(div => {
      div.id = "setting";
      div.classList.add("setting");
      doc.createElement("p")
      .then(title => {
        title.innerText = "设置";
        title.classList.add("settingTitle");
        title.addEventListener("click", event => {
          if(window.childPage) return;
          // let d = doc.query("#setting");
          Mask.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
          setTimeout(() => {
            document.body.classList.remove("no-scroll");
            Mask.remove();
          }, 100);
        });
        doc.createElement("div")
        .then(inner => {
          inner.id = "inner";
          inner.classList.add("inner");
          for(let o of options){
            doc.createElement("div")
            .then(option => {
              option.classList.add("option");
              option.addEventListener("click", () => {
                optionPage(o.id, option);
              });
              doc.createElement("div")
              .then(optionTitle => {
                optionTitle.id = `optionTitle${o.id}`;
                optionTitle.innerText = o.name;
                optionTitle.classList.add("optionTitle");
                option.append(optionTitle);
              });
              doc.createElement("div")
              .then(optionDescription => {
                optionDescription.id = `optionDescription${o.id}`;
                optionDescription.innerText = o.description;
                if(o.extra != undefined) o.extra(optionDescription);
                optionDescription.classList.add("optionDescription");
                option.append(optionDescription);
              });
              inner.append(option)
            });
          }
          div.append(inner);
        })
        div.append(title);
      });
      Mask.append(div);
    });
    document.body.append(Mask);
  });
}

function init(){
  // 创建页面主框架
  // 第一个信息栏
  doc.createElement("div")
  .then(div => {
    div.classList.add("outside");
    div.id = "info";
    // 第一个信息栏 > 神秘 GIF 动图
    doc.createElement("div")
    .then(div2 => {
      div2.classList.add("img_box");
      doc.createElement("img")
      .then(img => {
        img.src = "/images/maho.gif";
        img.addEventListener("click", setting);
        div2.append(img)
      });
      div.append(div2);
    })
    // 第一个信息栏 > 状态栏：“控制中心”
    doc.createElement("div")
    .then(div2 => {
      div2.classList.add("controlCenter");
      // 第一个信息栏 > 状态栏：“控制中心” > statusbar
      doc.createElement("div")
      .then(div3 => {
        div3.id = "statusbar";
        div3.classList.add("statusbar");
        // 第一个信息栏 > 状态栏：“控制中心” > statusbar > status 信息
        doc.createElement("div")
        .then(div4 => {
          doc.createElement("p")
          .then(p => {
            p.id = "status";
            p.innerText = "神秘状态: 跑丢了"
            div4.append(p);
          })
          doc.createElement("p")
          .then(p => {
            p.id = "runMode";
            p.innerText = "工作模式: 不知道"
            div4.append(p);
          })
          doc.createElement("p")
          .then(p => {
            p.id = "res";
            p.innerText = "内存占用: 不知道"
            div4.append(p);
          })
          doc.createElement("p")
          .then(p => {
            p.id = "cpu";
            p.innerText = "CPU占用率: 0%"
            div4.append(p);
          })
          doc.createElement("p")
          .then(p => {
            p.id = "connect";
            p.innerText = "连接数量: 不知道"
            div4.append(p);
          })
          doc.createElement("p")
          .then(p => {
            p.id = "apMode";
            p.innerText = "热点模式: 不知道"
            div4.append(p);
          })
          div3.append(div4);
        });
        // 第一个信息栏 > 状态栏：“控制中心” > controller
        doc.createElement("div")
        .then(div3 => {
          div3.id = "controller";
          div3.classList.add("controller");
          doc.createElement("button")
          .then(button => {
            button.addEventListener("click", (event) => {
              // 启动神秘
              xixo.postKernel("start", text => {
                logging.info(text);
              });
            });
            button.id = "start";
            button.classList.add("button");
            button.innerText = "启动";
            div3.append(button);
          })
          doc.createElement("button")
          .then(button => {
            button.addEventListener("click", () => {
              // 重启神秘
              xixo.postKernel("restart", text => {
                logging.info(text);
              });
            });
            button.id = "restart";
            button.classList.add("button");
            button.innerText = "重启";
            div3.append(button);
          });
          doc.createElement("button")
          .then(button => {
            button.addEventListener("click", () => {
              // 关闭神秘
              xixo.postKernel("stop", text => {
                logging.info(text);
              });
            });
            button.id = "stop";
            button.classList.add("button");
            button.innerText = "停止";
            div3.append(button);
          })
          div2.append(div3);
        });
        div2.append(div3);
      });
      // 速率显示
      doc.createElement("div")
      .then(speed => {
        if(!config("speed")) speed.style.display = "none";
        speed.id = "speed";
        speed.classList.add("speed");
        doc.createElement("p")
        .then(p => {
          doc.createElement("span").then(span => {
            span.classList.add("speedIcon");
            span.innerText = "↑";
            p.append(span);
          });
          doc.createElement("span").then(span => {
            span.id = "speedUpload";
            span.classList.add("speedText");
            span.innerText = "0.00B";
            p.append(span);
          });
          speed.append(p);
        });
        doc.createElement("p")
        .then(p => {
          doc.createElement("span").then(span => {
            span.classList.add("speedIcon");
            span.innerText = "↓";
            p.append(span);
          });
          doc.createElement("span").then(span => {
            span.id = "speedDownload";
            span.classList.add("speedText");
            span.innerText = "0.00B";
            p.append(span);
          });
          speed.append(p);
        });
        div.append(speed);
      });
      div.append(div2);
    });
    doc.query("#app").append(div);
  });
  // 第二个信息栏
  doc.createElement("div")
  .then(div => {
    div.classList.add("outside");
    div.id = "subs";
    doc.createElement("p")
    .then(p => {
      if(!config("YiYan")) p.style.display = "none";
      p.id = "jinrishici-sentence";
      p.innerText = "点我拉取所有机场"
      p.classList.add("yiyan");
      p.addEventListener("click", event => {
        xixo.setSubsInfos("all", (err, text) => {
          if(err) return;
          console.log(texr);
        });
      });
      doc.createElement("script")
      .then(s => {
        s.src = "https://sdk.jinrishici.com/v2/browser/jinrishici.js";
        document.body.append(s);
      });
      div.append(p)
    })
    setInterval(() => {
      if(window.jirishici == undefined)return;
      jinrishici.load(result => {
        doc.query("#jinrishici-sentence").innerText = result.data.content;
      });
    }, 30000);
    return div
  })
  .then(div => document.getElementById("app").append(div));
  // log 显示栏
  doc.createElement("div")
  .then(div => {
    if(!config("log")) div.style.display = "none";
    div.classList.add("outside");
    div.id = "log";
    doc.createElement("div")
    .then(log => {
      log.classList.add("logs");
      log.id = "logBox";
      xixo.getLogDetail((err,json) => {
        if(err) return;
        for(let l of json){
          generationLog(l)
          .then(p => log.append(p))
        }
      });
      window.logUpdateInterval = setInterval(() => {
        xixo.getLog((err, text) => {
          if(err) return;
          if(window.logUpdatetimeStamp != text){
            window.logUpdatetimeStamp = text;
            xixo.getLogDetail((err, json) => {
              for(let l of json){
                if(doc.query(`#log_${l.id.split("-").join("")}`).length == 0){
                  generationLog(l)
                  .then(p => {
                    log.append(p);
                    log.scrollTop = log.scrollHeight + log.offsetHeight;
                  })
                }
              }
            });
            log.scrollTop = log.scrollHeight + log.offsetHeight;
          }
        });
      }, 1000);
      div.append(log)
    })
    return div
  })
  .then(div => document.getElementById("app").append(div));
  // 状态检测
  function buttonSwitchStatus(select, animation, enable, timeout = 1000){
    let s = doc.query(select);
    if(s.disabled != enable){
      s.disabled = enable;
    }
  }
  function refreshStatus(xixo){
    xixo.getKernel((err, status) => {
      if(err) return;
      switch(status.status){
        case "working":
          if(xixo.lastStatus == undefined){
            xixo.lastStatus = "working";
            refreshConnections(xixo);
          }
          doc.query("#status").innerText = "神秘状态: 工作中";
          doc.query("#runMode").innerText = `运行模式: ${status.workMode}`;
          doc.query("#apMode").innerText = `热点模式: ${status.apMode ? "已开启" : "未开启"}`;
          doc.query("#cpu").innerText = `CPU占用率: ${status.cpu}%`;
          buttonSwitchStatus("#start", "buttonDisable", true, 500)
          buttonSwitchStatus("#restart", "buttonEnable", false, 500);
          buttonSwitchStatus("#stop", "buttonEnable", false, 500);
          break;
        case "restarting":
          doc.query("#status").innerText = "神秘状态: 重启中";
          doc.query("#runMode").innerText = "运行模式: 不知道";
          doc.query("#apMode").innerText = "热点模式: 不知道";
          doc.query("#cpu").innerText = "CPU占用率: 0%";
          buttonSwitchStatus("#start", "buttonDisable", true, 500);
          buttonSwitchStatus("#restart", "buttonDisable", true, 500);
          buttonSwitchStatus("#stop", "buttonDisable", true, 500);
          break;
        case "stopping":
          doc.query("#status").innerText = "神秘状态: 停止中";
          doc.query("#runMode").innerText = "运行模式: 不知道";
          doc.query("#apMode").innerText = "热点模式: 不知道";
          doc.query("#cpu").innerText = "CPU占用率: 0%";
          buttonSwitchStatus("#start", "buttonDisable", true, 500);
          buttonSwitchStatus("#restart", "buttonDisable", true, 500);
          buttonSwitchStatus("#stop", "buttonDisable", true, 500);
          break;
        case "stopped":
          doc.query("#status").innerText = "神秘状态: 已停止";
          doc.query("#runMode").innerText = "运行模式: 不知道";
          doc.query("#apMode").innerText = "热点模式: 不知道";
          doc.query("#cpu").innerText = "CPU占用率: 0%";
          buttonSwitchStatus("#start", "buttonEnable", false, 500);
          buttonSwitchStatus("#restart", "buttonDisable", true, 500);
          buttonSwitchStatus("#stop", "buttonDisable", true, 500);
          break;
        case "starting":
          doc.query("#status").innerText = "神秘状态: 启动中";
          doc.query("#runMode").innerText = "运行模式: 不知道";
          doc.query("#apMode").innerText = "热点模式: 不知道";
          doc.query("#cpu").innerText = "CPU占用率: 0%";
          buttonSwitchStatus("#start", "buttonDisable", true, 500);
          buttonSwitchStatus("#restart", "buttonDisable", true, 500);
          buttonSwitchStatus("#stop", "buttonDisable", true, 500);
          break;
        default:
          break;
      }
    })
  }
  function refreshConnections(xixo){
    try{
      xixo.getConnections((err, connects) => {
        if(err){
          if(xixo.status == "working" && xixo.lastStatus != "working"){
            doc.query("#res").innerText = "内存占用: 0.00B";
            doc.query("#connect").innerText = "连接数量: 0";
            doc.query("#speedUpload").innerText = "0.00B";
            doc.query("#speedDownload").innerText = "0.00B";
          } else {
            doc.query("#res").innerText = "内存占用: 不知道";
            doc.query("#connect").innerText = "连接数量: 不知道";
            doc.query("#speedUpload").innerText = "0.00B";
            doc.query("#speedDownload").innerText = "0.00B";
          }
          return;
        }
        doc.query("#res").innerText = `内存占用: ${toMemory(connects.memory)}`;
        doc.query("#connect").innerText = `连接数量: ${connects.connections.length ? connects.connections.length : 0}`;
        if(window.uploadTotal != undefined && window.downloadTotal){
          doc.query("#speedUpload").innerText = `${toMemory(connects.uploadTotal - window.uploadTotal)}`;
          doc.query("#speedDownload").innerText = `${toMemory(connects.downloadTotal - window.downloadTotal)}`;
        }
        window.uploadTotal = connects.uploadTotal;
        window.downloadTotal = connects.downloadTotal;
      });
    }
    catch(err){
      if(xixo.status != "working"){
        doc.query("#res").innerText = "内存占用: 不知道";
        doc.query("#connect").innerText = "连接数量: 不知道";
        return;
      }
      refreshStatus(xixo)
    }
  }
  // 第一个信息栏
  refreshStatus(xixo);
  refreshConnections(xixo);
  window.refreshStatusInterval = setInterval(() => {
    refreshStatus(xixo);
  }, 1000);
  window.refreshConnectionsInterval = setInterval(() => {
    refreshConnections(xixo);
  }, 1000);
  // 加载第二个信息栏
  xixo.getSubsInfos((err, infos) => {
    if(err) return;
    for(let i of infos.providers){
      doc.createElement("div")
      .then(div => {
        div.classList.add("subs");
        doc.createElement("p")
        .then(p => {
          p.innerText = i.name;
          p.classList.add("subsTitle");
          div.append(p);
        });
        doc.createElement("div")
        .then(container => {
          container.classList.add("container");
          if(i.type == "http" && i.subInfo.support){
            // 上传流量
            doc.createElement("p")
            .then(subinfo => {
              subinfo.classList.add("uploadFlowRate");
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoIcon");
                span.innerText = "↑";
                subinfo.append(span);
              })
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoText");
                span.innerText = toMemory(i.subInfo.info.upload);
                subinfo.append(span);
              })
              container.append(subinfo);
            });
            // 下载流量
            doc.createElement("p")
            .then(subinfo => {
              subinfo.classList.add("downloadFlowRate");
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoIcon");
                span.innerText = "↓";
                subinfo.append(span);
              })
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoText");
                span.innerText = toMemory(i.subInfo.info.download);
                subinfo.append(span);
              })
              container.append(subinfo);
            });
            // 已用流量
            doc.createElement("p")
            .then(subinfo => {
              subinfo.classList.add("usedFlowRate");
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoIcon");
                span.innerText = "⇵";
                subinfo.append(span);
              })
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoText");
                span.innerText = toMemory(i.subInfo.info.upload + i.subInfo.info.download);
                subinfo.append(span);
              })
              container.append(subinfo);
            });
            // 总量
            doc.createElement("p")
            .then(subinfo => {
              subinfo.classList.add("totalFlowRate");
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoIcon");
                span.innerText = "◔";
                subinfo.append(span);
              })
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoText");
                span.innerText = toMemory(i.subInfo.info.total);
                subinfo.append(span);
              })
              container.append(subinfo);
            });
            // 过期时间
            doc.createElement("p")
            .then(subinfo => {
              subinfo.classList.add("expireDate");
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoIcon");
                span.innerText = "↹";
                subinfo.append(span);
              })
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoText");
                if(i.subInfo.info.expire == 0){
                  span.innerText = "不限时";
                } else {
                  let date = new Date(i.subInfo.info.expire);
                  span.innerText = `${String(date.getFullYear()).slice(2)}/${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
                }
                subinfo.append(span);
              })
              container.append(subinfo);
            });
            // 上次更新时间
            doc.createElement("p")
            .then(subinfo => {
              subinfo.classList.add("updateTime");
              subinfo.addEventListener("click", event => {
                xixo.setSubsInfos(i.name, (err, text) => {
                  if(err) return;
                  console.log(text);
                });
              });
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoIcon");
                span.innerText = "↺";
                subinfo.append(span);
              })
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoText");
                let date = new Date(i.subInfo.timeStamp);
                span.innerText = `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
                subinfo.append(span);
              })
              container.append(subinfo);
            });
          } else if(i.type == "http" && i.subInfo.support == false){
            doc.createElement("p")
            .then(p => {
              p.innerText = "无法查询使用情况";
              p.classList.add("httpFlowRate");
              container.append(p);
            })
            // 上次更新时间
            doc.createElement("p")
            .then(subinfo => {
              subinfo.classList.add("httpUpdateTime");
              subinfo.addEventListener("click", event => {
                xixo.setSubsInfos(i.name, (err, text) => {
                  if(err) return;
                  console.log(text);
                });
              });
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoIcon");
                span.innerText = "↺";
                subinfo.append(span);
              })
              doc.createElement("span")
              .then(span => {
                span.classList.add("infoText");
                let date = new Date(i.subInfo.timeStamp);
                span.innerText = `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
                subinfo.append(span);
              })
              container.append(subinfo);
            });
          } else {
            doc.createElement("p")
            .then(p => {
              p.innerText = "本地配置";
              p.classList.add("fileFlowRate");
              container.append(p);
            })
          }
          div.append(container);
        });
        return div;
      })
      .then(div => doc.query("#subs").append(div));
    }
  });
}

function verifyAuthorizationCode(auth = localStorage.auth || "node"){
  return new Promise((resolve, reject) => {
    let tXixo = new api(auth);
    tXixo.resKernel("GET")
    .then(response => {
      if(response.ok){
        resolve({key: 0, msg: "The authorization code is correct"});
      } else {
        reject({key: 1, msg: "Authorization Error"});
      }
    })
    .catch(err => {
      reject({key: 2, msg: "Unable to connect to server"});
    });
  });
}

function getAuth(){
  doc.createElement("div")
  .then(div => {
    div.id = "authorization";
    div.classList.add("authorization");
    return div;
  })
  .then(div => doc.query("#app").append(div));
  doc.createElement("p")
  .then(p => {
    p.innerText = "请输入授权码";
    p.id = "tip";
    return p
  })
  .then(p => doc.query("#authorization").append(p));
  doc.createElement("input")
  .then(input => {
    input.type = "text";
    input.id = "inputAuth";
    input.addEventListener("keypress", (event) => {
      if(event.key == "Enter"){
        function switchError(text, time = 3000){
          let tip = doc.query("#tip");
          if(window.tipText == undefined){
            window.tipText = tip.innerText;
          }
          tip.innerText = text;
          tip.setAttribute("style", "color: #ff" + getComputedStyle(doc.query('html')).getPropertyValue('--authorization-tip-color').slice(3));
          setTimeout(() => {
            tip.removeAttribute("style");
            tip.innerText = window.tipText;
          }, time);
        }
        if(input.value != "" && input.value){
          let tXixo = new api(input.value);
          verifyAuthorizationCode(input.value)
          .then(() => {
            localStorage.auth = input.value;
            doc.query("#authorization").remove();
            window.xixo = new api(localStorage.auth);
            init();
          })
          .catch(err => {
            if(err.key == 1){
              switchError("授权码错误！");
            } else if(err.key == 2){
              switchError("无法连接神秘后端");
            }
          })
        } else if(input.value == ""){
          switchError("授权码不能为空！");
        }
      }
    });
    return input
  })
  .then(input => doc.query("#authorization").append(input));
}

if(localStorage.getItem("mystery") == undefined){
  fetch("/config.json")
  .then(response => response.json())
  .then(json => {
    localStorage.setItem("mystery", JSON.stringify(json));
  })
}

window.onload= () => {
  if(localStorage.auth){
    verifyAuthorizationCode()
    .then(() => {
      window.xixo = new api(localStorage.auth);
      init();
    })
    .catch(err => {
      localStorage.clear();
      getAuth();
    });
  } else {
    // 从用户手中获取神秘“咒语”
    getAuth();
  }
}
