// const tinderUser = new Object()
const tinderUser = {}

 tinderUser.id = "123abc"
 tinderUser.name = "Rudy"
 tinderUser.isLoggedin = false

// console.log(tinderUser);

const regularuser = {
  email: "Rudy@gmail.com",
  fullname:{
    userfullname:{
      firstname: "Rudranil",
      lastname: "Saha"
    }
  }
}

// console.log(regularuser.fullname?.userfullname.firstname);

const obj1 = {1: "a",2: "b"}
const obj2 = {3: "a",4: "b"}
const obj4 = {4: "a",6: "b"}

// const obj3 = { obj1, obj2 }
// const obj3= Object.assign({}, obj1, obj2,obj4)
const obj3 = {...obj1,...obj2}

// console.log(obj3);

const users = [
  {
    id: 1,
    email: "h@gmail.com"
  },
  {
    id: 1,
    email: "h@gmail.com"
  },
  {
    id: 1,
    email: "h@gmail.com"
  },
  {
    id: 1,
    email: "h@gmail.com"
  },
]

users[1].email;
// console.log(tinderUser);

// console.log(Object.keys(tinderUser));
// console.log(Object.values(tinderUser));
// console.log(Object.entries(tinderUser));


// console.log(tinderUser.hasOwnProperty('isLoggedin'));


const course = {
  coursename: "js in hindi",
  price:"999",
  courseInstructor:"hitesh"

}

// course.courseInstructor

const {courseInstructor: instructor} = course
console.log(instructor);
