import { doc, config } from "../document.js";
import { maho } from "../api.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function mystery(e){
  if(document.getElementById("settingBox")) return;
  panel.maho().then(req => req.json()).then(json => {
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
            goto("/setting");
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
                panel.maho({"apMode.enabled": input.checked}, "PATCH").then(req => {
                  if(!req.ok) setTimeout(() => {
                    input.checked = lastChecked;
                  }, 500);
                }).catch(err => {
                  logging.error(err);
                  setTimeout(() => {
                    input.checked = lastChecked;
                  }, 500);
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
                panel.maho({"apMode.compatibilityMode": input.checked}, "PATCH").then(req => {
                  if(!req.ok) setTimeout(() => input.checked = lastChecked, 500);
                }).catch(err => {
                  logging.error(err);
                  setTimeout(() => input.checked = lastChecked, 500);
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
              panel.maho({"bindHost": input.checked ? "0.0.0.0" : "127.0.0.1"}, "PATCH").then(req => {
                if(!req.ok) setTimeout(() => input.checked = lastChecked, 500);
              }).catch(err => {
                logging.error(err);
                setTimeout(() => input.checked = lastChecked, 500);
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
              panel.maho({"startWithSingBox": input.checked}, "PATCH").then(req => {
                if(!req.ok) setTimeout(() => input.checked = lastChecked, 500);
              }).catch(err => {
                logging.error(err);
                setTimeout(() => input.checked = lastChecked, 500);
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
              panel.maho({"autoDownSub": input.checked}, "PATCH").then(req => {
                if(!req.ok) setTimeout(() => input.checked = lastChecked, 500);
              }).catch(err => {
                logging.error(err);
                setTimeout(() => input.checked = lastChecked, 500);
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
              panel.maho({"autoDownGeo.enabled": input.checked}, "PATCH").then(req => {
                if(!req.ok) setTimeout(() => input.checked = lastChecked, 500);
              }).catch(err => {
                logging.error(err);
                setTimeout(() => input.checked = lastChecked, 500);
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
              panel.maho({"immediateProtect": input.checked}, "PATCH").then(req => {
                if(!req.ok) setTimeout(() => input.checked = lastChecked, 500);
              }).catch(err => {
                logging.error(err);
                setTimeout(() => input.checked = lastChecked, 500);
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
              panel.maho({"mode": select.value}, "PATCH").then(req => {
                if(!req.ok) setTimeout(() => input.checked = lastChecked, 500);
              }).catch(err => {
                logging.error(err);
                setTimeout(() => input.checked = lastChecked, 500);
              });
            });
            doc.createElement("option")
            .then(option2 => {
              option2.innerText = "全局"
              option2.value = "Global";
              if(json.mode == "Global") option2.selected = true;
              select.append(option2);
            });
            doc.createElement("option")
            .then(option2 => {
              option2.innerText = "规则"
              option2.value = "Rule";
              if(json.mode == "Rule") option2.selected = true;
              select.append(option2);
            });
            doc.createElement("option")
            .then(option2 => {
              option2.innerText = "直连"
              option2.value = "Direct";
              if(json.mode == "Direct") option2.selected = true;
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
              panel.maho({"authorizationKey": input.value}, "PATCH").then(req => {
                if(!req.ok){
                  setTimeout(() => input.checked = lastChecked, 500);
                } else {
                  localStorage.auth = input.value;
                  window.panel = new maho(localStorage.auth);
                }
              }).catch(err => {
                logging.error(err);
                setTimeout(() => input.checked = lastChecked, 500);
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
              panel.config().then(req => {
                if(!req.ok) alert("重载基础术式失败: " + response.status + ", 请刷新网页重试");
              }).catch(err => {
                logging.error(err);
                alert("重载基础术式失败: 无法连接到神秘后端");
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
              panel.maho(null, "PUT").then(req => {
                if(!req.ok) alert("生成分享配置失败: " + response.status + ", 请刷新网页重试");
              }).catch(err => {
                logging.error(err);
                alert("生成分享配置失败: 无法连接到神秘后端");
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
              panel.maho({"ipv6": input.checked}, "PATCH").then(req => {
                if(!req.ok) setTimeout(() => input.checked = lastChecked, 500);
              }).catch(err => {
                logging.error(err);
                setTimeout(() => input.checked = lastChecked, 500);
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
      document.querySelector('#app').append(div);
    });
  }).catch(err => {
    logging.error(ert);
    alert("连接错误: ", err);
  });
}
