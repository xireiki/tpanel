import { goto, loadPage } from "./route.js";

if(localStorage.getItem("mystery") == undefined){
	localStorage.setItem("mystery", JSON.stringify({
		log: true,
		speed: false,
		shortly: false,
		YiYan: true
	}));
}

window.addEventListener("load", () => {
	window.addEventListener("popstate", e => {
		if (e.state) {
			loadPage(e.state.path);
		}
	})
	const path = window.location.pathname;
	history.replaceState({path: path}, '', document.location.href);
	loadPage(path);
})
