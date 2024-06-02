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
					description: "FakeIP 可以减少 DNS 请求。"
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
							goto("/auth")
						})
				})
	});
}

export function fakeip(){
	if(!window.panel){
		return getPanel(fakeip)
	}
	doc.createElement("div", {id: "fakeip", class: ["settingBox"]}, document.querySelector('#app'))
		.then(div => {
			doc.createElement("p", {innerText: "FakeIP", onclick: ()=>{goto("/setting/dns")}}, div)
			panel.fakeip()
				.then(response => response.json())
				.then(fakeip => {
					doc.createElement("div", null, div)
						.then(option => {
							doc.createElement("p", {innerText: "启用 FakeIP", class: ["settingName"]}, option)
							doc.createElement("div", null, option)
								.then(labelBox => {
									doc.createElement("input", {id: "fakeipChecked", type: "checkbox", checked: fakeip.enabled ? true : false}, labelBox)
										.then(input => {
											input.setAttribute("style", "width: 0; height: 0;");
										});
									doc.createElement("label", {class: ["toggle"]}, labelBox)
										.then(label => {
											label.htmlFor = "fakeipChecked";
										});
								});
						});
					doc.createElement("div", {id: "inet4_range"}, div)
						.then(option => {
							doc.createElement("p", {innerText: "inet4_range", id: "inet4_range_name", class: ["settingName"]}, option)
							doc.createElement("div", {id: "inet4_range_box"}, option)
							.then(auth => {
								doc.createElement("input", {id: "inet4_range_input", type: "text", value: fakeip["inet4_range"]}, auth)
							});
						});
						doc.createElement("div", {id: "inet6_range"}, div)
						.then(option => {
							doc.createElement("p", {innerText: "inet6_range", id: "inet6_range_name", class: ["settingName"]}, option)
							doc.createElement("div", {id: "inet6_range_box"}, option)
							.then(auth => {
								doc.createElement("input", {id: "inet6_range_input", type: "text", value: fakeip["inet6_range"]}, auth)
							});
						});
					doc.createElement("button", {id: "submit", innerText: "提交"}, div)
						.then(button => {
							button.addEventListener("click", event => {
								const newFakeip = {
									enabled: doc.query("#fakeipChecked").checked,
									"inet4_range": doc.query("#inet4_range_input").value,
									"inet6_range": doc.query("#inet6_range_input").value
								}
								panel.fakeip(newFakeip, "PUT").then(req => {
									if(!req.ok){
										alert("修改失败，请刷新重试!");
										return goto("/auth")
									}
									fakeip = newFakeip;
								}).catch(err => {
									alert("无法连接到神秘后端!");
								});
							});
						})
				})
	})
}
