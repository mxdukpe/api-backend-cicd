function isValidEmail(email) {
    if (!email || typeof email !== "string") return false;
    
    let atIndex = email.indexOf("@");
    // L'email doit avoir un @, il ne doit pas être en premier (<= 0),
    // ni en dernière position
    if (atIndex <= 0 || atIndex === email.length - 1) return false;
    
    // On extrait le domaine (tout ce qu'il y a après le @)
    let domainPart = email.slice(atIndex + 1);
    
    // Le domaine doit contenir un point (qui n'est pas le tout dernier ni le premier caractère)
    let dotIndex = domainPart.indexOf(".");
    if (dotIndex <= 0 || dotIndex === domainPart.length - 1) return false;
    
    return true;
}

function isValidPassword(password) {
    let result = { valid: false, errors: [] };
    
    if (!password || typeof password !== "string") {
        result.errors.push("Mot de passe vide");
        return result;
    }
    
    let hasUpper = false;
    let hasLower = false;
    let hasDigit = false;
    let hasSpecial = false;
    const specialChars = "!@#$%^&*";
    
    // Analyse from scratch, lettre par lettre !
    for (let i = 0; i < password.length; i++) {
        let char = password[i];
        if (char >= 'A' && char <= 'Z') hasUpper = true;
        else if (char >= 'a' && char <= 'z') hasLower = true;
        else if (char >= '0' && char <= '9') hasDigit = true;
        else if (specialChars.includes(char)) hasSpecial = true;
    }
    
    // On accumule les erreurs
    if (password.length < 8) result.errors.push("Trop court");
    if (!hasUpper) result.errors.push("Majuscule manquante");
    if (!hasLower) result.errors.push("Minuscule manquante");
    if (!hasDigit) result.errors.push("Chiffre manquant");
    if (!hasSpecial) result.errors.push("Spécial manquant");
    
    // S'il n'y a aucune erreur, le mot de passe est 100% valide
    if (result.errors.length === 0) {
        result.valid = true;
    }
    
    return result;
}

function isValidAge(age) {
    // Ne doit pas être null et doit être de type Number
    if (age === null || typeof age !== 'number') return false;
    
    // Ne doit pas être un nombre à virgule (ex: 25.5)
    if (!Number.isInteger(age)) return false;
    
    // Doit être entre 0 et 150
    if (age < 0 || age > 150) return false;
    
    return true;
}

module.exports = { isValidEmail, isValidPassword, isValidAge };
