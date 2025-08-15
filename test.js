const person = {name: "Alice", age: 25};
for (const key in person) {
    console.log(key);
    console.log(person);
    console.log(person[key])
    console.log(person.key)
}