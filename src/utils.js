function capitalize(str) {
    if (!str) return "";
    let result = "";

    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (i === 0) {
            if (code >= 97 && code <= 122) {
                result += String.fromCharCode(code - 32);
            } else {
                result += str[i];
            }
        } else {
            if (code >= 65 && code <= 90) {
                result += String.fromCharCode(code + 32);
            } else {
                result += str[i];
            }
        }
    }
    return result;
}

function calculateAverage(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }

    let average = sum / numbers.length;
    let temp = average * 100;
    let entier = parseInt(temp);
    let decimal = temp - entier;

    if (decimal >= 0.5) {
        entier++;
    } else if (decimal < -0.5) {
        entier -= 1;
    }

    return entier / 100;
}

function slugify(text) {
    if (!text) return "";
    
    let result = "";
    let lastWasDash = false;
    
    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i);
        let char = text[i];
        let isAlphanumeric = false;
        
        if (code >= 65 && code <= 90) { 
            char = String.fromCharCode(code + 32);
            isAlphanumeric = true;
        } else if ((code >= 97 && code <= 122) || (code >= 48 && code <= 57)) { 
            isAlphanumeric = true;
        }
        
        if (isAlphanumeric) {
            result += char;
            lastWasDash = false;
        } else {
            if (code === 39) continue;
            
            if (!lastWasDash && result.length > 0) {
                result += "-";
                lastWasDash = true;
            }
        }
    }
    
    let cleanResult = "";
    for (let i = 0; i < result.length; i++) {
        if (i === result.length - 1 && result[i] === '-') {
            continue;
        }
        cleanResult += result[i];
    }
    
    return cleanResult;
}

function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function sortStudents(students, sortBy, order = "asc") {
    // Si l'entrée est vide ou null, on renvoie []
    if (!students || !Array.isArray(students) || students.length === 0) {
        return [];
    }

    // Copie du tableau pour ne pas muter l'original
    return [...students].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        // Tri pour les chaînes de caractères (nom)
        if (typeof valA === 'string' && typeof valB === 'string') {
            if (order === 'desc') {
                return valB.localeCompare(valA);
            }
            return valA.localeCompare(valB);
        }

        // Tri pour les nombres (age, grade)
        if (order === 'desc') {
            return valB - valA;
        }
        return valA - valB;
    });
}

module.exports = { capitalize, calculateAverage, slugify, clamp, sortStudents };