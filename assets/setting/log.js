import { doc, config } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function log(){
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
					goto("/setting");
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
		document.querySelector('#app').append(div);
	});
}