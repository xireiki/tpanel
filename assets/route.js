import { maho } from "./api.js";
import { verifyAuthorizationCode } from "./document.js";

import { index } from "./pages/home.js"
import { auth } from "./pages/auth.js";
import { setting } from "./setting/setting.js";
import { general } from "./setting/general.js";
import { mystery } from "./setting/mystery.js";
import { packageListOption } from "./setting/package.js";
import { log } from "./setting/log.js";
import { ntp } from "./setting/ntp.js";
import { outboundProvider } from "./setting/outbound-provider.js";
import { outbounds } from "./setting/outbounds.js";
import { dnsServer } from "./setting/dns.js";

const pages = {
	"/": index,
	"/auth": auth,
	"/setting": setting,
	"/setting/general": general,
	"/setting/mystery": mystery,
	"/setting/package": packageListOption,
	"/setting/log": log,
	"/setting/ntp": ntp,
	"/setting/provider": outboundProvider,
	"/setting/outbounds": outbounds,
	"/setting/dnsServer": dnsServer
}

export function loadPage(path){
	document.querySelector('#app').innerHTML= "";
	if(path != "/auth" && (!window.panel || !window.clashapi)){
		if(localStorage.getItem("auth") != null){
			verifyAuthorizationCode()
				.then(pan => {
					window.panel = pan;
					return pages[path]();
				})
				.catch(err => {
					return goto("/auth")
				})
		} else {
			return goto("/auth")
		}
	} else {
		pages[path]();
	}
}

export function goto(path){
	history.pushState({path: path}, '', path);
	loadPage(path);
}
