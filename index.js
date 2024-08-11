const a = fromValue(1);
const b = fromValue(2);
const c = from(a, b).depend((a, b) => a + b + 5);
const d = from(c).depend((c) => c * 10);

console.log(a.getValue()); // 1
console.log(b.getValue()); // 2
console.log(c.getValue()); // 8
console.log(d.getValue()); // 80

a.update((val) => val + 10);
b.update((val) => val + 10);
c.update((val) => val - 5);

console.log(a.getValue()); // 11
console.log(b.getValue()); // 12
console.log(с.getValue()); // 28
console.log(d.getValue()); // 23

// fromBoolean

const truee = fromBoolean(true);
const truee2 = form(truee).same();
const truee3 = form(truee2).opposite();

console.log(truee2); // true
console.log(truee3); // false

truee.update(val => !val);
truee2.update(val => !val);

console.log(truee2); // false
console.log(truee3); // true

// arrays

const arr = fromArray([1, 2, 3]);
const brr = from(arr).map(el => el * 2) // cb to each element
 
console.log(arr.getValue()) // [1, 2, 3]
console.log(brr.getValue()) // [2, 4, 6]

arr.update(el => el + 1)

console.log(arr.getValue()) // [2, 3, 4]
console.log(brr.getValue()) // [4, 6, 8]

const crr = from(brr).filter(el => el > 5)  // cb to each element

console.log(crr.getValue())  // [8]

brr.update(el => el - 3);

console.log(crr.getValue())  // [1, 3]