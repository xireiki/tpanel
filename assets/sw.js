if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		// 注册 service worker
		navigator.serviceWorker.register("/sw.js", {scope: "/"}).then(registeration => {
			console.info("PWA Registered！scope: " + registeration.scope);
		}).catch (err => {
			console.error("PWA Registration Failed.");
		});
		// 提醒用户页面已更新
		navigator.serviceWorker.oncontrollerchange = e => {
			alert("页面已更新");
		}
		// 提示使用离线版本
		if(!navigator.onLine){
			console.warn("Is currently offline.");
			// 提示离线逻辑
			window.addEventListener("online", e => {
				console.info("Network is connected.")
			})
		}
	});
}