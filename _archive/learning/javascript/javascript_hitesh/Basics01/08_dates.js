// Dates//

// let myDate = new Date()
// console.log(myDate);
// console.log(typeof myDate);

// let myCreatedDate = new Date(2023,11,8);
// let myCreatedDate = new Date("2023-12-20");
// let myCreatedDate = new Date("02-13-2004");
// console.log(myCreatedDate);

// let myTimeStamp = Date.now();
// console.log(myTimeStamp);
// console.log(Math.floor(Date.now() / 1000));

let newDate = new Date();
console.log(newDate);
console.log(newDate.getMonth() + 1);
console.log(newDate.getDay());

newDate.toLocaleString('default', {
  weekday: "long"
})




