import { maho } from "./api.js";

export const doc = {
  createElement: function(tagName) {
    return new Promise(resolve => {
      const element = document.createElement(tagName);
      resolve(element);
    });
  },
  getElement: function(select, context){
    return new Promise(resolve => {
      context = context || document;
      const element = context.querySelectorAll(select);
      if(element.length == 1){
        resolve(Array.prototype.slice.call(element)[0]);
      } else {
        resolve(Array.prototype.slice.call(element));
      }
    });
  },
  query: function(select, context){
    context = context || document;
    const element = context.querySelectorAll(select);
    if(element.length == 1){
      return Array.prototype.slice.call(element)[0];
    }
    return Array.prototype.slice.call(element);
  },
  jsonp: function jsonp(url, callback) {
    const fnName = 'jsonpCallback_' + Math.round(100000 * Math.random());
    window[fnName] = function(data) {
      callback(data);
      delete window[fnName];
    }
    const fullUrl = `${url}?callback=${fnName}`;
    const script = document.createElement('script');
    script.src = fullUrl;
    document.body.appendChild(script);
  }
}

export function toMemory(memory){
  let Reversal = false;
  if(memory < 0){
    Reversal = true;
    memory = -1 * memory;
  }
  if(memory < 1024)
    return (Reversal ? "-" : "") + memory.toFixed(2) + "B";
  else if(memory < 1048576)
    return (Reversal ? "-" : "") + (memory / 1024).toFixed(2) + "KB";
  else if(memory < 1073741824)
    return (Reversal ? "-" : "") + (memory / 1048576).toFixed(2) + "MB";
  else if(memory < 1099511627776)
    return (Reversal ? "-" : "") + (memory / 1073741824).toFixed(2) + "GB";
  else if(memory < 1125899906842624)
    return (Reversal ? "-" : "") + (memory / 1099511627776).toFixed(2) + "TB";
  else if(memory < 1152921504606846976)
    return (Reversal ? "-" : "") + (memory / 1125899906842624).toFixed(2) + "PB";
  else
    return (Reversal ? "-" : "") + (memory / 1152921504606846976).toFixed(2) + "EB";
}

export function config(key, value){
  if(value != undefined && key != undefined){
    let tmpObj = JSON.parse(localStorage.getItem("mystery") || "{}");
    tmpObj[key] = value;
    return localStorage.setItem("mystery", JSON.stringify(tmpObj));
  } else if(key != undefined){
    return JSON.parse(localStorage.getItem("mystery") || '{}')[key];
  } else {
    return JSON.parse(localStorage.getItem("mystery") || '{}');
  }
}

export function verifyAuthorizationCode(auth = localStorage.auth || "node"){
  return new Promise((resolve, reject) => {
    let p = new maho(auth);
    p.check().then(() => {
      resolve(p);
    })
    .catch(err => {
      console.log(err);
      reject(err);
    });
  });
}

function generateThumbnails(imageFile) {
  return new Promise((resolve, reject) => {
    createImageBitmap(imageFile).then(imageBitmap => {
      const canvas = document.createElement('canvas')
      canvas.width = imageBitmap.height > 1000 ? (imageBitmap.height / 4) : (imageBitmap.height / 2)
      canvas.height = imageBitmap.width > 1000 ? (imageBitmap.width / 4) : (imageBitmap.width / 2)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height)
      const url = canvas.toDataURL('image/jpeg')
      // console.log('缩略图')
      // console.log('%c  ', 'background:url(' + url + ') no-repeat ;line-height:' + canvas.height + 'px;font-size:' + canvas.height + 'px')
      if (url.length > 80 * 1024) {
        generateThumbnails(convertBase64UrlToBlob(url)).then(res => {
          resolve(res)
        })
      } else {
        resolve(url)
      }
    }).catch((err) => {
      reject('缩略图生成失败：' + err)
    })
  })
}

function convertBase64UrlToBlob(base64) {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const str = atob(arr[1])
  let n = str.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = str.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

function getBase64ImageUrl(url, callBack, imgType) {
  if(!imgType){
    imgType = "image/png";
  }
  let img = new Image(); 
  img.src= url;
  img.crossOrigin = "anonymous";
  img.onload = function(){
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");  
    ctx.drawImage(img, 0, 0);
    let dataURL = canvas.toDataURL(imgType);
    callBack(dataURL);
  }
}

function getColors(image) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const colors = [];
    for(let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1]; 
      const blue = data[i + 2];
      colors.push([red, green, blue]);
    }
    const sortedColors = colors.sort((a, b) => 
      colors.filter(v => v===a).length - colors.filter(v => v===b).length
    );
    const mostFrequentColor = sortedColors[sortedColors.length - 1];
    resolve('rgb(' + mostFrequentColor.join(',') + ')');
  });
}

export function getDominantColor(){
  return new Promise((resolve, reject) => {
    getBase64ImageUrl("/images/bg.png", dataUrl => {
      generateThumbnails(convertBase64UrlToBlob(dataUrl))
      .then(img => {
        doc.createElement("img")
        .then(i => {
          i.src = img;
          i.style.display = "none";
          i.onload = function(){
            getColors(i).then(color => {
              // window.bgDominantColor = color;
              resolve(color);
              i.remove();
            });
          }
          document.body.append(i);
        })
      })
      .catch(err => {
        logging.error(err);
        reject(err)
      });
    });
  });
}
