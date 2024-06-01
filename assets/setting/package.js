import { doc, config } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function packageListOption(e){
  if(document.getElementById("packageListOption")) return;
  // 盒子
  doc.createElement("div")
  .then(div => {
    div.id = "packageListOption";
    div.classList.add("settingBox");
    // 标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "应用名单";
      p.addEventListener("click", () => {
        goto("/setting");
      })
      div.append(p);
    });
    panel.list().then(json => json.json())
    .then(json => {
      // 总开关
      doc.createElement("div")
      .then(option => {
        doc.createElement("p")
        .then(p => {
          p.classList.add("settingName")
          p.innerText = "总开关";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = "listChecked"
            input.type = "checkbox";
            input.checked = json.enabled ? true : false;
            input.addEventListener("change", event => {
              setTimeout(() => {
                input.checked = json.enabled ? true : false;
              }, 500);
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "listChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
      // 黑白名单
      let package_list = json.mode == "white" ? json.white : json.black;
      doc.createElement("div")
      .then(option => {
        doc.createElement("p")
        .then(p => {
          p.classList.add("settingName")
          p.innerText = "黑名单/白名单";
          option.append(p);
        });
        doc.createElement("div")
        .then(labelBox => {
          doc.createElement("input")
          .then(input => {
            input.id = "listModeChecked"
            input.type = "checkbox";
            input.checked = json.mode == "white" ? true : false;
            input.addEventListener("change", event => {
              panel.listMode({mode: input.checked ? "white" : "black"}, "PATCH").then(req => {
                if(!req.ok){
                  alert("修改失败，请刷新重试！");
                  setTimeout(() => input.checked = json.mode == "white" ? true : false, 500);
                } else {
                  for(let p of package_list){
                    document.getElementById(p).checked = false;
                  }
                  json.mode = json.mode == "white" ? "black" : "white";
                  package_list = json.mode == "white" ? json.white : json.black;
                  for(let p of package_list){
                    document.getElementById(p).checked = true;
                  }
                }
              }).catch(err => {
                logging.error(err);
                alert("无法连接神秘后端，请检查 node 状态！");
                setTimeout(() => input.checked = json.mode == "white" ? true : false, 500);
              });
            });
            input.setAttribute("style", "width: 0; height: 0;");
            labelBox.append(input);
          });
          doc.createElement("label")
          .then(label => {
            label.htmlFor = "listModeChecked";
            label.classList.add("toggle");
            labelBox.append(label);
          });
          option.append(labelBox);
        });
        div.append(option)
      });
      // 分割线
      doc.createElement("div")
      .then(PartitionLine => {
        PartitionLine.id = "PartitionLine";
        div.append(PartitionLine)
      })
      // 应用
      panel.labels()
      .then(json => json.json())
      .then(packages => {
        packages = Object.entries(packages).sort((a, b) => {
          const valueA = a[1].toLowerCase();
          const valueB = b[1].toLowerCase();
          if (valueA < valueB) {
            return -1;
          } else if (valueA > valueB) {
            return 1;
          } else {
            return 0;
          }
        }).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        for(const pn of package_list){
          doc.createElement("div")
          .then(option => {
            doc.createElement("p")
            .then(p => {
              p.classList.add("settingName")
              p.innerText = packages[pn] ? packages[pn] : pn;
              option.append(p);
            });
            doc.createElement("div")
            .then(labelBox => {
              doc.createElement("input")
              .then(input => {
                input.id = pn;
                input.type = "checkbox";
                input.checked = true;
                input.addEventListener("change", event => {
                  if(event.target.checked){
                    package_list.push(event.target.id);
                  } else {
                    package_list = package_list.filter(item => item != event.target.id);
                  }
                  json.mode == "white" ? json.white = package_list : json.black = package_list;
                  panel.listList({mode: json.mode, list: package_list})
                  .then(req => {
                    if(!req.ok){
                      alert("失败");
                      setTimeout(() => {
                        event.target.checked = true;
                      }, 500);
                    }
                  })
                });
                input.setAttribute("style", "width: 0; height: 0;");
                labelBox.append(input);
              });
              doc.createElement("label")
              .then(label => {
                label.htmlFor = pn;
                label.classList.add("toggle");
                labelBox.append(label);
              });
              option.append(labelBox);
            });
            div.append(option)
          });
        }
        for(let pn in packages){
          if(package_list.some(item => item == pn)) continue;
          doc.createElement("div")
          .then(option => {
            doc.createElement("p")
            .then(p => {
              p.classList.add("settingName")
              p.innerText = packages[pn] ? packages[pn] : pn;
              option.append(p);
            });
            doc.createElement("div")
            .then(labelBox => {
              doc.createElement("input")
              .then(input => {
                input.id = pn;
                input.type = "checkbox";
                input.checked = false;
                input.addEventListener("change", event => {
                  if(event.target.checked){
                    package_list.push(event.target.id);
                  } else {
                    package_list = package_list.filter(item => item != event.target.id);
                  }
                  json.mode == "white" ? json.white = package_list : json.black = package_list;
                  panel.listList({mode: json.mode, list: package_list})
                  .then(req => {
                    if(!req.ok){
                      alert("失败");
                      setTimeout(() => {
                        event.target.checked = false;
                      }, 500);
                    }
                  })
                });
                input.setAttribute("style", "width: 0; height: 0;");
                labelBox.append(input);
              });
              doc.createElement("label")
              .then(label => {
                label.htmlFor = pn;
                label.classList.add("toggle");
                labelBox.append(label);
              });
              option.append(labelBox);
            });
            div.append(option)
          });
        }
      })
    })
    document.querySelector('#app').append(div);
  });
}
