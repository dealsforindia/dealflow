//scope
//global scope

 let a = 500;

//block scope 

if(true){
let  a = 20
 const b = 70
//  var c = 80

// console.log("Inner",a);

}
// console.log("outer",a);


//Nested Scope


function one(){

 const username = "Hitesh"
 function two(){

   const website = "Youtube"
   console.log(username);
   
 }
// console.log(website);

two()

}

// one()

if(true){
  const username = "Hitesh"
  if(username === "Hitesh"){
    const website = " youtube"
  //  console.log( username + website);
   
  }
  // console.log(website);
  
}
// console.log(username);


// +++++++++++++++++ interesting +++++++++++++++++++

//declaration
console.log(addone(5));

function addone(num)
{
  return num + 1
}
// Declaration holding variable
addTwo(7)
const addTwo = function(num){
  return num + 33
}


