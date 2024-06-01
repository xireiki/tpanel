import { doc } from "../document.js";
import { maho } from "../api.js";
import { goto } from "../route.js";

export function auth(){
	return new Promise((resolve, reject) => {
		doc.createElement("div")
			.then(div => {
				div.id = "authorization";
				div.classList.add("authorization");
				return div;
			})
			.then(div => doc.query("#app").append(div));
		doc.createElement("p")
			.then(p => {
				p.innerText = "请输入授权码";
				p.id = "tip";
				return p
			})
			.then(p => doc.query("#authorization").append(p));
		doc.createElement("input")
			.then(input => {
				input.type = "text";
				input.id = "inputAuth";
				input.addEventListener("keypress", (event) => {
					if(event.key == "Enter"){
						function switchError(text, time = 3000){
							let tip = doc.query("#tip");
							if(window.tipText == undefined){
								window.tipText = tip.innerText;
							}
							tip.innerText = text;
							tip.setAttribute("style", "color: #ff" + getComputedStyle(doc.query('html')).getPropertyValue('--authorization-tip-color').slice(3));
							setTimeout(() => {
								tip.removeAttribute("style");
								tip.innerText = window.tipText;
							}, time);
						}
						if(input.value != "" && input.value){
							let check = new maho(input.value);
							check.check()
							.then(() => {
								localStorage.auth = input.value;
								doc.query("#authorization").remove();
								window.panel = new maho(localStorage.auth);
								goto("/");
							})
							.catch(err => {
								console.log(err)
								if("Unauthorization" === err.message){
									switchError("授权码错误！");
								} else if(err){
									switchError("无法连接神秘后端");
								}
							})
						} else if(input.value == ""){
							switchError("授权码不能为空！");
						}
					}
				});
				return input
			})
			.then(input => doc.query("#authorization").append(input));
	})
}
