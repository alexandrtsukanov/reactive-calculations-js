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

// Functions

const f = (a, b) => a + b;
const f1 = fromFunction(f)

console.log(f1.getValue()(10, 5));   // 15

const f2 = from(f1).depend(val => val + 1);

console.log(f2.getValue()(10, 5));   // 16

const fnew = (a, b) => a * b;
f1.update(fnew);

console.log(f1.getValue()(10, 5)); // 50
console.log(f2.getValue()(10, 5)); // 51

f2(f1(...args))

// Promises

const p1 = new Promise((res) => {
    setTimeout(() => {
        res(1)
    }, 1000)
})

const pp1 = fromAsync(p1);
pp1.getValue().then(val => console.log(val))   // 1

const pp2 = from(pp1).depend(val => val + 5);
pp2.getValue().then(val => console.log(val))   // 6

const r = /\d+.\d?/
const r1 = fromRegExp(r);
const r2 = from(r1).addFlags('g', 'i');

r1.update(/\\[a-z]+.\d?/)
console.log(r2.getValue().test('a.123 B.4567'));   // ['a.123', 'B.4567']