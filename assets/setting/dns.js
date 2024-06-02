import { doc, config, getPanel } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function dns(){

	doc.createElement("div", {id: "dns", class: ["setting"]}, document.querySelector('#app'))
		.then(div => {
			doc.createElement("p", {innerText: "DNS", class: ["settingTitle"]}, div)
				.then(p => {
					p.addEventListener("click", () => {
						goto("/setting");
					});
				});
			const pages = [
				{
					url: "/setting/dns/server",
					name: "DNS 服务",
					description: "这就是书灵~"
				},
				{
					url: "/setting/dns/rules",
					name: "DNS 规则",
					description: "骚年~掌控规则把~"
				},
				{
					url: "/setting/dns/fakeip",
					name: "FakeIP",
					description: "FakeIP 可以减少 DNS 请求"
				}
			]
			pages.forEach(page => {
				doc.createElement("div", {class: ["option"], onclick: () => {goto(page.url)}}, div)
					.then(div3 => {
						doc.createElement("p", {id: "dnsName", class: ["optionTitle"], innerText: page.name}, div3)
						doc.createElement("p", {id: "dnsDescription", class: ["optionDescription"], innerText: page.description}, div3)
					})
			})
		})
}

export function dnsServer(){
	if(!window.panel){
		return getPanel(dnsServer)
	}
	doc.createElement("div", {id: "dnsServer", class: ["settingListBox"]}, document.querySelector('#app'))
		.then(div => {
			doc.createElement("p", {innerText: "DNS 服务", class: ["subsTitle"]}, div)
				.then(p => {
					p.addEventListener("click", () => {
						goto("/setting/dns");
					});
				});
			doc.createElement("div", {class: ["allsub"]}, div)
				.then(div2 => {
					panel.dns()
						.then(response => response.json())
						.then(dnses => {
							dnses.forEach(dns => {
								doc.createElement("div", {id: "dns_" + dns.tag, class: ["everysub"]}, div2)
									.then(dnsElement => {
										doc.createElement("p", {id: "dns_" + dns.tag + "_name", class: ["dnsName"], innerText: dns.tag}, dnsElement)
										doc.createElement("p", {id: "dns_" + dns.tag + "_type", class: ["dnsType"], innerText: dns.type === "urltest" ? "自动选择" : dns.type === "selector" ? "手动选择" : "未适配类型"}, dnsElement)
										doc.createElement("p", {id: "dns_" + dns.tag + "_enabled", class: ["dnsEnabled"], innerText: dns.enabled == undefined ? "已启用" : dns.enabled ? "已启用" : "已停用"}, dnsElement)
									})
							})
						}).catch(err => {
							console.error(err)
							// goto("/auth")
						})
				})
	});
}
