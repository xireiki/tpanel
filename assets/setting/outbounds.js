import { doc, config, getPanel } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function outbounds(){
	if(!window.panel){
		return getPanel(outbounds)
	}
	doc.createElement("div", {id: "outbounds", class: ["settingListBox"]}, document.querySelector('#app'))
		.then(div => {
			doc.createElement("p", {innerText: "出站", class: ["subsTitle"]}, div)
				.then(p => {
					p.addEventListener("click", (event) => {
						div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
						setTimeout(() => {
							goto("/setting");
						}, 100);
					});
				});
			doc.createElement("div", {class: ["allsub"]}, div)
				.then(div2 => {
					panel.outbounds()
						.then(response => response.json())
						.then(outbounds => {
							outbounds.forEach(outbound => {
								doc.createElement("div", {id: "out_" + outbound.tag, class: ["everysub"]}, div2)
									.then(outElement => {
										doc.createElement("p", {id: "out_" + outbound.tag + "_name", class: ["outboundName"], innerText: outbound.tag}, outElement)
										doc.createElement("p", {id: "out_" + outbound.tag + "_type", class: ["outboundType"], innerText: outbound.type === "urltest" ? "自动选择" : outbound.type === "selector" ? "手动选择" : "未适配类型"}, outElement)
										doc.createElement("p", {id: "out_" + outbound.tag + "_type", class: ["outboundType"], innerText: outbound.enabled == undefined ? "已启用" : outbound.enabled ? "已启用" : "已停用"}, outElement)
									})
							})
						}).catch(err => {
							goto("/auth")
						})
				})
		});
}

export function outboundEdit(id){

}
