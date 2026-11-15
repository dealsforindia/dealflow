// function saymyname(){

// console.log("R");
// console.log("u");
// console.log("d");
// console.log("r");
// console.log("a");
// console.log("n");
// console.log("i");
// console.log("l");


// }

// saymyname()

// function addtwonumbers(Number1,Number2){


//   let result = Number1 + Number2
//   console.log(result);
  
  
// }

// addtwonumbers(2,null)



function loginUserMessege(username = "sam"){

  if(!username){
      console.log("please enter a username");
      return
  }
return `${username} just logged in`



}

console.log(loginUserMessege())




function calculateCartprice(...num1){
  return num1
}

console.log(calculateCartprice(200,400,1000));
