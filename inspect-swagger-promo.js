const fs = require('fs');
const path = require('path');

// Read the temp swagger file - adjusting path to where it likely is or downloading it again
const swaggerUrl = 'https://dev.axadjonovsardorbek.uz/api/swagger/doc.json';

async function listPromoCodeReq() {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(swaggerUrl);
        const swagger = await response.json();

        console.log('--- PromoCodeCreateReq Properties ---');
        const def = swagger.definitions['models.PromoCodeCreateReq'];
        if (def) {
            Object.keys(def.properties).forEach(key => {
                const prop = def.properties[key];
                console.log(`${key}: type=${prop.type}, format=${prop.format}, required=${(def.required || []).includes(key)}`);
            });
            console.log('Required fields:', def.required);
        } else {
            console.log('Definition models.PromoCodeCreateReq not found');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listPromoCodeReq();
