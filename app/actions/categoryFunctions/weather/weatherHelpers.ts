import { Coordinates } from "@/app/types";

async function getCoordinates(location:string): Promise<Coordinates> {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    
    try {
        const response = await fetch(nominatimUrl, {headers: {
            'User-Agent': 'ApexAssistant/1.0 (alyoshkamyshko@gmail.com)',
            'Referer': 'https://apexassistant.vercel.app'
        }});
        const data = await response.json();
    
        if (data.length > 0) {
            return {
                latitude: data[0].lat,
                longitude: data[0].lon
            };
        } else {
            return {}
        }
    } catch (error) {
        return {}
    }
}

export { getCoordinates }