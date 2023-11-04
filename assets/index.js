import { processTasks, SuperTask, runTask, makeWorker } from "./task.js";
import { maho, clash } from "./api.js";
import { getAuth } from "./getAuth.js";
import { verifyAuthorizationCode } from "./document.js";
import { init } from "./init.js";

if(localStorage.getItem("mystery") == undefined){
  fetch("/config.json")
  .then(response => response.json())
  .then(json => {
    localStorage.setItem("mystery", JSON.stringify(json));
  })
}

window.onload = () => {
  if(localStorage.auth){
    verifyAuthorizationCode()
    .then(() => {
      window.panel = new maho(localStorage.auth);
      panel.kernel().then(req => req.json()).then(json => {
        window.clashapi = new clash(json.secret);
      }).catch(err => logging.error(err));
      init();
    })
    .catch(err => {
      console.log(err);
      localStorage.clear();
      getAuth();
    });
  } else {
    getAuth();
  }
}
