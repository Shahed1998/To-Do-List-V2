'use strict';
const body = document.querySelector('#body');
const goBack = document.querySelector('#go-back');
body.addEventListener('keydown', (e) => {
  // console.log(e.keyCode);
  if (e.keyCode === 13) {
    goBack.setAttribute('type', 'button');
  }
});
