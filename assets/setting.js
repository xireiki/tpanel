import { doc, config } from "./document.js";
import { logging } from "./logging.js";
import { general } from "./setting/general.js";
import { mystery } from "./setting/mystery.js";
import { packageListOption } from "./setting/package.js";

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
    panel.subsList().then(req => req.json()).then(json => {
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
    }).catch(err => logging.error(ert));
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
    panel.boxNTP().then(req => req.json()).then(json => {
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
          panel.boxNTP(json, "PUT").then(req => {
            if(!req.ok) alert("修改失败，请刷新重试");
          }).catch(err => {
            logging.error(err);
            alert("无法连接到神秘后端!");
          });
        });
        div.append(button);
      });
    }).catch(err => {
      logging.error(err);
      alert("无法连接到神秘后端!请刷新网页重试!");
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
    panel.boxLog().then(req => req.json()).then(json => {
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
          if(json.notice == undefined){
            json.notice = "";
          }
          panel.boxLog(json, "PUT").then(req => {
            if(!req.ok) alert("修改失败，请刷新重试!");
          }).catch(err => {
            logging.error(err);
            alert("无法连接到神秘后端!");
          });
        });
        div.append(button);
      });
    }).catch(err => {
      logging.error(err);
      alert("无法连接到神秘后端，请刷新网页重试！");
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
    case 8:
      packageListOption(e);
    default:
      window.childPage = false;
      break;
  }
}

export function setting(){
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
        panel.subsList().then(req => req.json()).then(json => {
          if(json.length == 0) description.innerText += "啥玩意儿？你一个机场都没？！";
          else if(json.length <= 3) description.innerText += `咦~你怎么才${json.length}个机场啊！`;
          else if(json.length > 3 && json.length <= 10) description.innerText += `你有${json.length}个机场。`;
          else description.innerText += `哇！！你居然有${json.length}个机场！`;
        }).catch(err => {
          logging.error(err);
          description.innerText += "你能告诉我吗？";
        });
      }
    },
    {
      id: 4,
      name: "出站",
      description: "订阅分组？传送阵！喵",
      extra: function(description){
        panel.outbounds().then(req => req.json()).then(json => {
          if(json.length == 0) description.innerText += "~ 你怎么一个传送阵都没呀？ 喵~";
          else if(json.length < 3) description.innerText += "~ 要坏掉了！ 喵"
          else if(json.length == 3) description.innerText += "~ 你是小白吗？居然只有1个新建的传送阵！ 喵";
          else if(json.length > 3 && json.length <= 10) description.innerText += "~ 是正常的！ 喵~";
          else description.innerText += "~ 你要这么多出站干什么呀？ 喵~";
        }).catch(err => {
          logging.error(err);
          description.innerText += "~";
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
    },
    {
      id: 8,
      name: "名单",
      description: "将垃圾应用加入指定名单，实现应用分流！"
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
