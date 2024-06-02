import { doc } from "../document.js";
import { goto } from "../route.js";

export function notFound(){
	doc.createElement("style", null, document.querySelector("#app"))
		.then(style => {
			style.textContent = `
				.notFound {
					max-width: 90%;
					max-height: 90%;
					margin: 2% 2%;
					padding: 2%;
					border: var(--border-size) solid var(--border-color);
					box-shadow: 0 0 10px var(--light-color);
					overflow: scroll;
					border-radius: 25px;
				}
			`
		})
	doc.createElement("div", {id: "notFound", class: ["notFound"]}, document.querySelector("#app"))
		.then(div => {
			div.innerHTML = "<h1>404 Not Found</h1><p>那个...那个⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄，其实这个页面她跑了... (*꒦ິ⌓꒦ີ)</p>"
		})
}