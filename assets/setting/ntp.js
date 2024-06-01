import { doc, config } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function ntp(){
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
					goto("/setting");
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
		document.querySelector('#app').append(div);
	});
}
