function sayMyName(){
console.log("H");
console.log("i");
console.log("t");
console.log("e");
console.log("s");
console.log("h");

}

// sayMyName : reference 
// sayMyName()
// sayMyName()

// function addTwoNumbers(Number1,Number2){

//   console.log(Number1 + Number2);
  
// }

function addTwoNumbers(Number1,Number2){
  //  let result = Number1 + Number2
  // return result
  return Number1 + Number2
}

// addTwoNumbers(2,"7")
// addTwoNumbers(2,null)

const result = addTwoNumbers(3,5)
// console.log("Result is",result);

// function loginUserMessege(username){
  //   if (username === undefined){
  // console.log("Please enter a username");
  // return
  
  //   }
  //   return `${username} just logged in`


  // if (!username){
  // console.log("Please enter a username");
  // return
  
  // }
  // return `${username} just logged in`
  // }
  function loginUserMessege(username = "sam"){
  if (!username){
console.log("Please enter a username");
return

  }
  return `${username} just logged in`
}



// console.log(loginUserMessege("Hitesh"));
// console.log(loginUserMessege("hitesh"));




function calculateCartprice(...num1){
  return num1
}
// function calculateCartprice(val1,val2,...num1){
// return num1}
 console.log(calculateCartprice(2000000,200,500,200,700)); //spread operator usecase for grabbing multiple parameters

// const user = {
//      username: "Rudy",
//      price: 199
// }
  function handleObject(anyobject){
      console.log(`Username is ${anyobject.username} and price is ${anyobject.price}`);
      
  }

  // handleObject(user)
//pricesafety problem hAPPENS above code if prices than price

//direct object while execution
  handleObject({
  username: "Rudy",
  price:399
  })

  const mynewArrey = [200,400,100]

  function returnSecondValue(getArrey){
   return getArrey[1]
  }

  // console.log(returnSecondValue(mynewArrey));
  console.log(returnSecondValue([200,500,1000]));
  