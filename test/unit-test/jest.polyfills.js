global.requestAnimationFrame = (cb) => {
  setTimeout(cb, 0);
};
global.cancelAnimationFrame = (cb) => {
  setTimeout(cb, 0);
};