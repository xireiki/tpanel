import { maho } from "./api.js";
import { verifyAuthorizationCode } from "./document.js";

import { index } from "./pages/home.js"
import { notFound } from "./pages/404.js"
import { auth } from "./pages/auth.js";
import { setting } from "./setting/setting.js";
import { general } from "./setting/general.js";
import { mystery } from "./setting/mystery.js";
import { packageListOption } from "./setting/package.js";
import { log } from "./setting/log.js";
import { ntp } from "./setting/ntp.js";
import { outboundProvider, outboundProviderEdit } from "./setting/outbound-provider.js";
import { outbounds, outboundEdit } from "./setting/outbounds.js";
import { dns, dnsServer, fakeip } from "./setting/dns.js";

const pages = {
	"/": index,
	"/404": notFound,
	"/auth": auth,
	"/setting": setting,
	"/setting/general": general,
	"/setting/mystery": mystery,
	"/setting/package": packageListOption,
	"/setting/log": log,
	"/setting/ntp": ntp,
	"/setting/provider": outboundProvider,
	"/setting/provider/:id": outboundProviderEdit,
	"/setting/outbounds": outbounds,
	"/setting/outbounds/:id": outboundEdit,
	"/setting/dns": dns,
	"/setting/dns/server": dnsServer,
	"/setting/dns/fakeip": fakeip
}

function getTargetRoute(path) {
	for (const [key, value] of Object.entries(pages)) {
		const regex = new RegExp(`^${key.replace(/:.+/g, '([^/]+)')}$`);
		const match = path.match(regex);
		if (match) {
			const args = match.slice(1);
			return [key, value, args];
		}
	}
	return [];
}

export function loadPage(path){
	document.querySelector('#app').innerHTML= "";
	let [newPath, func, args] = getTargetRoute(path);
	if(newPath === path){
		func()
	} else if(!newPath){
		goto("/404", true)
	} else {
		func(...args)
	}
}

export function goto(path, replace){
	if(replace){
		history.replaceState({path: path}, '', path);
	} else {
		history.pushState({path: path}, '', path);
	}
	loadPage(path);
}
