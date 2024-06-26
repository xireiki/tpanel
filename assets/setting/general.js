import { doc, config } from "../document.js";
import { goto } from "../route.js";

export function general(e){
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
					goto("/setting");
				}, 100);
			});
			div.append(p);
		});
		let toggleOptionList = [
			{
				id: "speed",
				key: "speed",
				target: "#speed",
				name: "在主页显示速率",
				action: function(event, selfObj){
					config(selfObj.key, event.target.checked);
				}
			},
			{
				id: "log",
				key: "log",
				target: "#log",
				name: "在主页显示日志",
				action: function(event, selfObj){
					config(selfObj.key, event.target.checked);
				}
			},
			{
				id: "yiyan",
				key: "YiYan",
				target: "#jinrishici-sentence",
				name: "启用一言",
				action: function(event, selfObj){
					config(selfObj.key, event.target.checked);
				}
			},
			{
				id: "subsOrder",
				key: "subsOrder",
				name: "订阅栏长按修改顺序",
				disabled: true,
				action: function(event, selfObj){
					config(selfObj.key, event.target.checked);
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
						
					}
				}
			},
			{
				id: "hideNamelessApp",
				key: "hideNameless",
				name: "仅显示有名称应用",
				action: function(event, selfObj){
					config(selfObj.key, event.target.checked);
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
		document.querySelector('#app').append(div);
	});
}