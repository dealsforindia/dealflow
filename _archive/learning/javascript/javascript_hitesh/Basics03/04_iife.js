// function chai(){
//   console.log(`DB Connected`);
  
// }
// chai()


//iifefvv
  //named iife
(function chai(){
  console.log(`DB Connected`);

})();
 //also named
(  function aurcode()  {
  console.log(`DB Connected Two`);

})();

    //two iife semicolon to stop

//using parameter
(  (name) => {
  console.log(`DB Connected Three ${name}`);
  
})('hitesh');
//Unnamed
(  () => {
  console.log(`DB Connected Four`);
  
})()

