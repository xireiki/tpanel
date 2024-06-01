import { goto } from "./route.js";

if(localStorage.getItem("mystery") == undefined){
  fetch("/config.json")
  .then(response => response.json())
  .then(json => {
    localStorage.setItem("mystery", JSON.stringify(json));
  })
}

window.addEventListener("load", () => {
	window.addEventListener("popstate", e => {
		if (e.state) {
			goto(e.state.path);
		}
	})
	goto(window.location.pathname);
})
