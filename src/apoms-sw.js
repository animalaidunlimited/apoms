importScripts('./ngsw-worker.js');


self.addEventListener('fetch', event=>{
  console.log(event);
});