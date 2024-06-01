import { doc, config } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

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
	switch(o){
		case 1:
			goto("/setting/general")
			break;
		case 2:
			goto("/setting/mystery");
			break;
		case 3:
			goto("/setting/provider");
			break;
		case 4:
			goto("/setting/outbounds");
			break;
		case 5:
			goto("/setting/dnsServer");
			break;
		case 6:
			goto("/setting/ntp");
			break;
		case 7:
			goto("/setting/log");
			break;
		case 8:
			goto("/setting/package");
		default:
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
		.then(div => {
			div.id = "setting";
			div.classList.add("setting");
			doc.createElement("p")
			.then(title => {
				title.innerText = "设置";
				title.classList.add("settingTitle");
				title.addEventListener("click", event => {
					goto("/");
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
			document.querySelector('#app').append(div);
	});
}
