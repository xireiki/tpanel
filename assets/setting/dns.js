import { doc, config } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function dnsServer(e){
  if(document.getElementById("dnsServer")) return;
  // 盒子
  doc.createElement("div")
  .then(div => {
    div.id = "dnsServer";
    div.classList.add("settingBox");
    // 标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "DNS";
      p.addEventListener("click", (event) => {
        div.setAttribute("style", "animation: FadeOut 0.1s ease-in forwards;");
        setTimeout(() => {
          goto("/setting");
        }, 100);
      });
      div.append(p);
    });
    
    document.querySelector('#app').append(div);
  });
}
