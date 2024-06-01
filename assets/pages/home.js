import { doc, config, toMemory } from "../document.js";
import { goto } from "../route.js";
import { logging } from "../logging.js";
import { processTasks, SuperTask, runTask, makeWorker } from "../task.js";

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

export function index(){
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
				img.addEventListener("click", () => {
					goto("/setting")
				});
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
							panel.kernel({method: "start"}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
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
							panel.kernel({method: "restart"}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
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
							panel.kernel({method: "stop"}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
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
			panel.logDetails().then(req => req.json()).then(json => {
				for(let l of json){
					generationLog(l).then(p => log.append(p))
				}
			}).catch(err => {
				console.log(err);
			})
			window.logUpdateInterval = setInterval(() => {
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
	function refreshStatus(){
		panel.kernel()
		.then(json => json.json())
		.then(status => {
			switch(status.status){
				case "working":
					try {
						refreshInfo(status.status);
					} catch(err){
						logging.error(err);
						doc.query("#res").innerText = "内存占用: 0.00B";
						doc.query("#connect").innerText = "连接数量: 0";
						doc.query("#speedUpload").innerText = "0.00B";
						doc.query("#speedDownload").innerText = "0.00B";
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
		.catch(err => {
			return;
		});
	}
	function refreshInfo(status){
		if(status == "working"){
			if(clashapi == undefined) return;
			clashapi.connections().then(req => req.json()).then(connects => {
				doc.query("#res").innerText = `内存占用: ${toMemory(connects.memory)}`;
				doc.query("#connect").innerText = `连接数量: ${connects.connections.length ? connects.connections.length : 0}`;
				if(window.uploadTotal != undefined && window.downloadTotal){
					doc.query("#speedUpload").innerText = `${toMemory(connects.uploadTotal - window.uploadTotal)}`;
					doc.query("#speedDownload").innerText = `${toMemory(connects.downloadTotal - window.downloadTotal)}`;
				}
				window.uploadTotal = connects.uploadTotal;
				window.downloadTotal = connects.downloadTotal;
			}).catch(err => logging.error(err))
		}
	}
	// 第一个信息栏
	refreshStatus();
	window.refreshStatusInterval = setInterval(() => {
		refreshStatus();
	}, 1000);
	// 加载第二个信息栏
	function refreshProviders(infos){
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
					if(i.type == "remote" && i.subInfo.support){
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
								panel.subsInfos({name: i.name}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
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
								panel.subsInfos({name: i.name}, "POST").then(req => req.text()).then(text => logging.info(text)).catch(err => console.log(err));
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
	}
	panel.subsInfos().then(json => json.json()).then(infos => {
		refreshProviders(infos);
	}).catch(err => {});
}
