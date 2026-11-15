const marvel_heros = ["Thor","iron-man","spiderman"]
const dc_heros = ["flash","bat-man","superman"]

//marvel_heros.push(dc_heros)
// console.log(marvel_heros);
// console.log(marvel_heros[3][1]);  

//concat

// const allheros = marvel_heros.concat(dc_heros)
// console.log(allheros);

// strad

const all_new_heros = [ ...marvel_heros, ...dc_heros ]
// console.log(all_new_heros);

// flat

const another_array = [1,2,3,[4,5,6],7,[6,7,[4,5]]]
const real_another_array = another_array.flat(Infinity)
console.log(real_another_array);


console.log(Array.isArray("Hitesh"));
console.log(Array.from("Hitesh"));
console.log(Array.from({name: "Hitesh"})); //interesting

let score1 = 100
let score2 = 200
let score3 = 300
let score4 = 400

console.log(Array.of(score1,score2,score4));

