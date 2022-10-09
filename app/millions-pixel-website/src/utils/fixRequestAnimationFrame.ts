let lastTime: number = 0;
const vendors: string[] = ["webkit", "moz"];
//如果window.requestAnimationFrame为undefined先尝试浏览器前缀是否兼容
for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
  // @ts-ignore
  window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
  // @ts-ignore
  window.cancelAnimationFrame = window[`${vendors[x]}CancelAnimationFrame`] || window[`${vendors[x]}CancelRequestAnimationFrame`];
}

if (!window.requestAnimationFrame && !window.cancelAnimationFrame) {
  window.requestAnimationFrame = function (callback) {
    let currTime = new Date().getTime();
    let timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
    let id = setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

export default {};

