import { doc, config } from "../document.js";
import { logging } from "../logging.js";
import { goto } from "../route.js";

export function outbounds(e){
  if(document.getElementById("outbounds")) return;
  // 盒子
  doc.createElement("div")
  .then(div => {
    div.id = "outbounds";
    div.classList.add("settingBox");
    // 标题
    doc.createElement("p")
    .then(p => {
      p.innerText = "出站";
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