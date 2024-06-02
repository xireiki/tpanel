import { goto, loadPage } from "./route.js";
import { verifyAuthorizationCode } from "./document.js";

if(localStorage.getItem("mystery") == undefined){
	localStorage.setItem("mystery", JSON.stringify({
		log: true,
		speed: false,
		shortly: false,
		YiYan: true
	}));
}

window.addEventListener("load", async () => {
	window.addEventListener("popstate", e => {
		if (e.state) {
			loadPage(e.state.path);
		}
	})
	const path = window.location.pathname;
	history.replaceState({path: path}, null, document.location.href);
	loadPage(path);
})
