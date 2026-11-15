const user = {
  username: "hitesh",
  price:999,

  welcomeMessage: function() {

    console.log(`${this.username},Welcome to website`);
    
console.log(this);
  }

}
// user.welcomeMessage()
// user.username = "sam"
// user.welcomeMessage()

// console.log(this);

// function chai(){
//   let username  = "Rudranil"
//   console.log(this.username);
  
// }
// chai()


// const chai = function () {
//   let username  = "Rudranil"
//   console.log(this.username);
// }
// chai()
// const chai =  () => {
//   let username  = "Rudranil"
//   console.log(this);
// }
// chai()

const addtwo = (num1,num2) =>{
  return num1 + num2
}
console.log(addtwo(3,4));


//implicit return
// const addtwo = (num1,num2) => num1 + num2
// const addtwo = (num1,num2) => (num1 + num2)
// const addtwo = (num1,num2) => ({username: "hitesh"})
  

// console.log(addtwo(3,4))


// const myArray = [2,3,25,52,525]  

// myArray.forEach()
