function calculateDeliveryFee(distance, weight) {
    if (distance < 0 || weight < 0) {
        throw new Error("La distance et le poids ne peuvent pas être négatifs");
    }

    if (distance > 10) {
        throw new Error("Hors zone de livraison (limite: 10 km)");
    }

    let fee = 2.00; // Tarif de base pour au plus 3 km

    if (distance > 3) {
        fee += (distance - 3) * 0.50; // Supplément par km au-delà de 3 km
    }

    if (weight > 5) {
        fee += 1.50; // Supplément poids lourd fixe pour l'exercice (au-dessus de 5kg)
    }

    return fee;
}

function applyPromoCode(subtotal, promoCodeStr, promoCodesList) {
    if (subtotal < 0) throw new Error("Le sous-total ne peut pas être négatif");
    if (!promoCodeStr) return subtotal; // null ou vide = pas de réduction

    const promo = promoCodesList.find(p => p.code === promoCodeStr);
    if (!promo) throw new Error("Code promo inexistant");

    if (subtotal < promo.minOrder) {
        throw new Error("Minimum de commande non atteint");
    }

    // On considère la date de fin à 23:59:59
    const expirationDate = new Date(promo.expiresAt + "T23:59:59Z");
    if (expirationDate < new Date()) {
        throw new Error("Code promo expiré");
    }

    let finalPrice = subtotal;
    if (promo.type === 'percentage') {
        finalPrice -= (subtotal * promo.value) / 100;
    } else if (promo.type === 'fixed') {
        finalPrice -= promo.value;
    }

    // Le prix ne peut pas être négatif
    return Math.max(0, finalPrice);
}

function calculateSurge(hour, dayOfWeek) {
    if (!dayOfWeek || typeof dayOfWeek !== 'string') {
        throw new Error("Jour de la semaine invalide");
    }
    
    const day = dayOfWeek.toLowerCase();
    let numHour = parseFloat(hour);
    
    // Autorise le format "12:30" => se transforme en 12.5
    if (typeof hour === 'string' && hour.includes(':')) {
        const parts = hour.split(':');
        numHour = parseInt(parts[0], 10) + (parseInt(parts[1], 10) / 60);
    }
    
    if (isNaN(numHour)) throw new Error("Heure invalide");

    // Fermeture à 22h pile (exclus) et ouverture à 10h pile (inclus)
    if (numHour < 10 || numHour >= 22) {
        throw new Error("Le service de livraison est fermé (Ouvert de 10h à 22h)");
    }
    
    const isWeekend = day === 'friday' || day === 'saturday' || day === 'sunday';
    const isLunch = numHour >= 11.5 && numHour < 14; // Déjeuner: de 11h30 à avant 14h00
    const isDinner = numHour >= 19 && numHour < 22;  // Dîner: de 19h00 à avant 22h00
    
    if (isWeekend && isDinner) {
        return 1.8;
    }
    
    if (isDinner) {
        return 1.5;
    }
    
    if (isLunch) {
        return 1.3;
    }
    
    if (day === 'sunday') {
        return 1.2;
    }
    
    return 1.0;
}

function calculateOrderTotal(items, distance, weight, promoCode, hour, dayOfWeek, promoCodesList = []) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Le panier est vide");
    }

    let subtotal = 0;
    for (const item of items) {
        if (item.price < 0 || item.quantity < 0) {
            throw new Error("Prix ou quantité négatif invalide");
        }
        subtotal += item.price * item.quantity;
    }

    // Le TP précise qu'avec un quantité de 0 on ignore. 
    // Au final on refuse un panier si le sous-total est 0.
    if (subtotal === 0) {
        throw new Error("Le panier est vide ou le prix total est 0");
    }

    let discount = 0;
    let discountedSubtotal = subtotal;

    if (promoCode) {
        discountedSubtotal = applyPromoCode(subtotal, promoCode, promoCodesList);
        discount = subtotal - discountedSubtotal;
    }

    const baseDeliveryFee = calculateDeliveryFee(distance, weight);
    const surge = calculateSurge(hour, dayOfWeek);
    
    // Le test précise bien: le surge ne s'applique qu'à la livraison
    const deliveryFee = baseDeliveryFee * surge; 

    const total = discountedSubtotal + deliveryFee;

    // Retour propre avec tous les éléments et 2 décimales maximum
    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        surge: parseFloat(surge.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

module.exports = { calculateDeliveryFee, applyPromoCode, calculateSurge, calculateOrderTotal };
