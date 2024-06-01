if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		// 注册 service worker
		navigator.serviceWorker.register("/sw.js", {scope: "/"}).then(registeration => {
			console.info("PWA 注册成功！scope: " + registeration.scope);
		}).catch (err => {
			console.error("PWA 注册失败.");
		});
		// 提醒用户页面已更新
		navigator.serviceWorker.oncontrollerchange = e => {
			alert("页面已更新");
		}
		// 提示使用离线版本
		if(!navigator.onLine){
			console.warn("目前处于离线状态");
			// 提示离线逻辑
			window.addEventListener("online", e => {
				console.info("网络已连接")
			})
		}
	});
}