//   #primitive

//  7 types  : String,Number ,boolean ,null ,undefined ,symbol ,Bigint

// const score = false
// const scoreValue = 100.3
// const isLoggedin = false
// const outsideTemp = null
// let userEmailS

// const id = Symbol('123')
// const anotherid = Symbol('123')

// console.log(id === anotherid);



// const bigNumber = 35345353434433455n 

//  Reference Type(Non primitive)

//  Arrey ,objects , functions

//  const heros = ["shaktiman", "naagraj" , "doga"] 


//Stack(Copy)

let myYoutube = "wouk";

let anotherYoutube = myYoutube;
anotherYoutube = "developer_divyanshu";

console.log(myYoutube);
console.log(anotherYoutube);
console.log(myYoutube==anotherYoutube);


// Heap

let userOne = {
  email: "user@gmail.com",
  upi: "user@ybl",
};

let userTwo = userOne;

userTwo.email = "user234@gmail.com";

console.log(userOne.email);
console.log(userTwo.email);
