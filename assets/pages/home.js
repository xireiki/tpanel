import { clash } from "../api.js";
import { doc, config, toMemory, getPanel } from "../document.js";
import { goto } from "../route.js";
import { logging } from "../logging.js";
import { processTasks, SuperTask, runTask, makeWorker } from "../task.js";
import { verifyAuthorizationCode } from "../document.js";

function generationLog(log){
	return new Promise(resolve => {
		doc.createElement("p")
		.then(p => {
			p.id = "log_" + log.id.split("-").join("");
			let logTime = log.time;
			let logType = log.level;
			let logText = log.contents[0];
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

const statusTable = {
	"working": "工作中",
	"starting": "启动中",
	"restarting": "重启中",
	"stopping": "停止中",
	"stopped": "已停止"
}

const buttonStatusTable = {
	"working": [true, false, false],
	"starting": [true, true, true],
	"restarting": [true, true, true],
	"stopping": [true, true, true],
	"stopped": [false, true, true]
}

function buttonSwitchStatus(select, animation, enable, timeout = 1000){
	let s = doc.query(select);
	if(s.disabled != enable){
		s.disabled = enable;
	}
}

function updateStatus(status, runMode, apMode, cpu, button = []){
	doc.query("#status").innerText = "神秘状态: " + statusTable[status];
	doc.query("#runMode").innerText = "运行模式: " + (runMode ? runMode : "?")
	doc.query("#apMode").innerText = "热点模式: " + (apMode == true ? "已开启" : apMode == false ? "已关闭" : "?")
	doc.query("#cpu").innerText = "CPU占用率: " + (cpu ? cpu + "%" : 0 + "%")
	buttonSwitchStatus("#start", "buttonDisable", button[0] ? button[0] : false, 500);
	buttonSwitchStatus("#restart", "buttonDisable", button[1] ? button[1] : false, 500);
	buttonSwitchStatus("#stop", "buttonDisable", button[2] ? button[2] : false, 500);
}

function setDrag(father, children){
	for(const child of children){
		child.setAttribute("draggable", true);
	}
	
}

function createSubInfo(cls, icon, data, father){
	doc.createElement("p", {class: [cls]}, father)
		.then(subinfo => {
			doc.createElement("span", {class: ["infoIcon"], innerText: icon}, subinfo)
			doc.createElement("span", {class: ["infoText"], innerText: data}, subinfo)
		});
}

function createContainer(info, father){
	const expData = info.subInfo.info.expire == 0 ? "不限时" : (function(){
		const date = new Date(info.subInfo.info.expire * 1000);
		return `${String(date.getFullYear()).slice(2)}/${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
	})()
	const date2 = new Date(info.subInfo.timeStamp);
	const updData = `${date2.getHours() < 10 ? '0' + date2.getHours() : date2.getHours()}:${date2.getMinutes() < 10 ? '0' + date2.getMinutes() : date2.getMinutes()}`;
	createSubInfo("uploadFlowRate", "↑", toMemory(info.subInfo.info.upload), father)
	createSubInfo("downloadFlowRate", "↓", toMemory(info.subInfo.info.download), father)
	createSubInfo("usedFlowRate", "⇵", toMemory(info.subInfo.info.upload + info.subInfo.info.download), father)
	createSubInfo("totalFlowRate", "◔", toMemory(info.subInfo.info.total), father)
	createSubInfo("expireDate", "↹", expData, father)
	createSubInfo("updateTime", "↺", updData, father)
}

function refreshProviders(infos){
	const subs = doc.query("#subs")
	const subList = []
	for(let i of infos.providers){
		doc.createElement("div", {class: ["subs"]}, subs)
			.then(div => {
				subList.push(div)
				doc.createElement("p", {innerText: i.name, class: ["subsTitle"]}, div)
				doc.createElement("div", {class: ["container"]}, div)
					.then(container => {
						if(i.type == "remote" && i.subInfo.support){
							createContainer(i, container)
						} else if(i.type == "remote" && !i.subInfo.support){
							doc.createElement("p", {innerText: "无法查询使用情况", class: ["httpFlowRate"]}, container)
							const date = new Date(i.subInfo.timeStamp);
							createSubInfo("httpUpdateTime", "↺", `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`, container)
						} else {
							doc.createElement("p", {innerText: "本地配置", class: ["fileFlowRate"]}, container)
						}
					})
			})
	}
	if(config("subsOrder")){
		setDrag(subs, doc.query(".subs"))
	}
}

function refreshStatus(){
	panel.kernel()
		.then(json => json.json())
		.then(status => {
			if(status.status === "working") {
				window.clashapi = new clash(status.secret)
				try {
					clashapi.connections().then(req => req.json()).then(connects => {
						doc.query("#res").innerText = `内存占用: ${toMemory(connects.memory)}`;
						doc.query("#connect").innerText = `连接数量: ${connects.connections != undefined ? connects.connections.length : 0}`;
						if(window.uploadTotal != undefined && window.downloadTotal){
							doc.query("#speedUpload").innerText = `${toMemory(connects.uploadTotal - window.uploadTotal)}`;
							doc.query("#speedDownload").innerText = `${toMemory(connects.downloadTotal - window.downloadTotal)}`;
						}
						window.uploadTotal = connects.uploadTotal;
						window.downloadTotal = connects.downloadTotal;
					})
				} catch(err){
					doc.query("#res").innerText = "内存占用: 0B";
					doc.query("#connect").innerText = "连接数量: 0";
					doc.query("#speedUpload").innerText = "0B";
					doc.query("#speedDownload").innerText = "0B";
				}
			} else {
				doc.query("#res").innerText = "内存占用: 0B";
				doc.query("#connect").innerText = "连接数量: 0";
				doc.query("#speedUpload").innerText = "0B";
				doc.query("#speedDownload").innerText = "0B";
			}
			updateStatus(status.status, status.workMode, status.apMode, status.cpu, buttonStatusTable[status.status])
		})
		.catch(err => {
			return;
		})
}

export function index(){
	if(!window.panel){
		return getPanel(index)
	}
	// 第一个信息栏
	doc.createElement("div", {id: "info", class: ["outside"]}, doc.query("#app"))
		.then(div => {
			doc.createElement("div", {class: ["img_box"]}, div)
				.then(div2 => {
					doc.createElement("img", {src: "/images/maho.gif", onclick: () => {goto("/setting")}}, div2)
				})
			doc.createElement("div", {class: ["controlCenter"]}, div)
				.then(div2 => {
					doc.createElement("div", {id: "statusbar", class: ["statusbar"]}, div2)
					.then(div3 => {
						doc.createElement("div", null, div3)
							.then(div4 => {
								doc.createElement("p", {id: "status", innerText: "神秘状态: ?"}, div4)
								doc.createElement("p", {id: "runMode", innerText: "运行模式: ?"}, div4)
								doc.createElement("p", {id: "res", innerText: "内存占用: ?"}, div4)
								doc.createElement("p", {id: "cpu", innerText: "CPU占用率: 0%"}, div4)
								doc.createElement("p", {id: "connect", innerText: "连接数量: 0"}, div4)
								doc.createElement("p", {id: "apMode", innerText: "热点模式: ?"}, div4)
							})
						doc.createElement("div", {id: "controller", class: ["controller"]}, div2)
						.then(div3 => {
							doc.createElement("button", {id: "start", class: ["button"], innerText: "启动"}, div3)
							.then(button => {
								button.addEventListener("click", (event) => {
									panel.kernel({method: "start"}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
								});
							})
							doc.createElement("button", {id: "restart", class: ["button"], innerText: "重启"}, div3)
							.then(button => {
								button.addEventListener("click", () => {
									panel.kernel({method: "restart"}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
								});
							});
							doc.createElement("button", {id: "stop", class: ["button"], innerText: "停止"}, div3)
							.then(button => {
								button.addEventListener("click", () => {
									panel.kernel({method: "stop"}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
								});
							})
						});
					});
					doc.createElement("div", {id: "speed", class: ["speed"]}, div)
						.then(speed => {
							if(!config("speed")) speed.style.display = "none";
							doc.createElement("p", null, speed)
								.then(p => {
									doc.createElement("span", {innerText: "↑", class: ["speedIcon"]}, p)
									doc.createElement("span", {innerText: "0.00B", class: ["speedText"], id: "speedUpload"}, p)
								});
							doc.createElement("p", null, speed)
								.then(p => {
									doc.createElement("span", {innerText: "↓", class: ["speedIcon"]}, p)
									doc.createElement("span", {innerText: "0.00B", class: ["speedText"], id: "speedDownload"}, p)
								})
						})
				})
			})
	// 第二个信息栏
	doc.createElement("div", {id: "subs", class: ["outside"]}, document.getElementById("app"))
		.then(div => {
			doc.createElement("p", {id: "jinrishici-sentence", innerText: "点我拉取所有机场", class: ["yiyan"]}, div)
				.then(p => {
					if(!config("YiYan")) p.style.display = "none";
					p.addEventListener("click", event => {
						panel.subsInfos({name: "all"}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
					});
					if(!document.querySelector('#yiyan')){
						doc.createElement("script")
							.then(s => {
								s.src = "https://sdk.jinrishici.com/v2/browser/jinrishici.js";
								s.id = "yiyan"
								document.body.append(s);
							});
					}
				})
			window.jinrishiciInterval = setInterval(() => {
				if(window.jirishici == undefined) return;
				if(location.pathname !=="/") clearInterval(window.jinrishiciInterval)
				jinrishici.load(result => {
					doc.query("#jinrishici-sentence").innerText = result.data.content;
				});
			}, 30000);
		})
	panel.subsInfos().then(json => json.json()).then(infos => {
		refreshProviders(infos);
	}).catch(err => console.error(err))
	// log 显示栏
	doc.createElement("div", {id: "log", class: ["outside"]}, document.getElementById("app"))
	.then(div => {
		if(!config("log")) div.style.display = "none";
		doc.createElement("div", {id: "logBox", class: ["logs"]}, div)
			.then(log => {
				panel.logDetails().then(req => req.json()).then(json => {
					for(let l of json){
						generationLog(l).then(p => log.append(p))
					}
				}).catch(err => console.error(err))
				window.logUpdateInterval = setInterval(() => {
					if(location.pathname != "/"){
						clearInterval(window.logUpdateInterval)
						return
					}
					panel.log().then(req => req.json()).then(text => {
						if(window.logUpdatetimeStamp != text){
							window.logUpdatetimeStamp = text;
							panel.logDetails().then(req => req.json()).then(json => {
								for(let l of json){
									if(doc.query(`#log_${l.id.split("-").join("")}`).length == 0){
										generationLog(l)
										.then(p => {
											log.append(p);
											log.scrollTop = log.scrollHeight + log.offsetHeight;
										})
									}
								}
							}).catch(err => {
								console.log(err)
							});
							log.scrollTop = log.scrollHeight + log.offsetHeight;
						}
					}).catch(err => {
						logging.error(err);
					});
				}, 1000);
			})
	})
	// 刷新第一个信息栏
	refreshStatus();
	window.refreshStatusInterval = setInterval(() => {
		if(location.pathname != "/"){
			clearInterval(window.refreshStatusInterval)
			return
		}
		refreshStatus();
	}, 1000);
}
