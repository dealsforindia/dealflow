// singleton 


// Object.create

//object literals 

const mySym = Symbol("key1")

const Jsuser = {

  name : "Rudranil",
  "full name" : "Rudranil Saha",
  [mySym]: "mykey1",
  age : 18,
  location : "Subhashgram",
  email : "rudranil204@gmail.com;",
  isLoggedin : false,
  lastLoginDays : ["Monday","Saturday"]
} 
// console.log(Jsuser.email);
// console.log(Jsuser["email"]);
// console.log(Jsuser["full name"]);
// console.log(Jsuser[mySym]);


Jsuser.email = "Rudranil@gmail.com"
// Object.freeze(Jsuser)
Jsuser.email = "Rudranil@aaaa.com"
// console.log(Jsuser);

Jsuser.greeting = function(){
  console.log("Hi js user");
  
}
Jsuser.greetingTwo = function(){
  console.log(`Hi js user,${this.name}`);
  
}
console.log(Jsuser.greeting);
console.log(Jsuser.greeting());
console.log(Jsuser.greetingTwo());

