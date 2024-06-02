import { doc, config, getPanel } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function outboundProvider(){
	if(!window.panel){
		return getPanel(outboundProvider)
	}
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
					goto("/setting");
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
		document.querySelector('#app').append(div);
	});
}

export function outboundProviderEdit(id){

}
