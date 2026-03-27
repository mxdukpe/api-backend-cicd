const { capitalize, calculateAverage, slugify, clamp } = require('./utils.js');

function main() {
    console.log("--- TEST DE CAPITALIZE ---");
    console.log(capitalize("hello"));
    console.log(capitalize("WORLD"));

    console.log("\n--- TEST DE CALCULATE AVERAGE ---");
    console.log(calculateAverage([10, 12, 14]));   // Attendu : 12
    console.log(calculateAverage([15]));           // Attendu : 15
    console.log(calculateAverage([]));             // Attendu : 0
    console.log(calculateAverage([10, 11, 12]));   // Attendu : 11
    console.log(calculateAverage(null));           // Attendu : 0
    console.log(calculateAverage([10, 0, 0]));     // Attendu : 3.33

    console.log("\n--- TEST DE SLUGIFY ---");
    console.log(slugify("Hello World"));           // Attendu : "hello-world"
    console.log(slugify(" Spaces Everywhere "));   // Attendu : "spaces-everywhere"
    console.log(slugify("C'est l'ete !"));         // Attendu : "cest-lete"
    console.log(slugify(""));                      // Attendu : ""

    console.log("\n--- TEST DE CLAMP ---");
    console.log(clamp(5, 0, 10));                  // Attendu : 5
    console.log(clamp(-5, 0, 10));                 // Attendu : 0
    console.log(clamp(15, 0, 10));                 // Attendu : 10
    console.log(clamp(0, 0, 0));                   // Attendu : 0
}

main();
