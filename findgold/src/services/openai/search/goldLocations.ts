import { openai } from '../client';

export interface Hotspot {
  location: string;  // Description du lieu précis
  description: string;  // Pourquoi c'est intéressant
  source: string;  // BRGM ou retour d'expérience
}

export interface GoldLocation {
  name: string;
  type: string;
  coordinates: [number, number];
  description: string;
  geology: string;
  history: string;
  rating: number; // 1-5
  sources: string[];
  hotspots: Hotspot[];
  isMainSpot: boolean; // true pour les 3 meilleurs spots, false pour les spots secondaires
  goldOrigin?: {
    description: string;
    brgmData: string;
    entryPoints: string[];
    affluents: string[];
  };
  referencedSpots?: {
    description: string;
    locations: string[];
    sources: string[];
  };
}

export interface GoldSearchResult {
  mainSpots: GoldLocation[];
  secondarySpots: GoldLocation[];
}

export async function searchGoldLocations(city: string, radius: number = 50): Promise<GoldSearchResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en orpaillage et géologie, spécialisé dans l'identification des spots aurifères en France. 
          
TÂCHE :
Identifie les cours d'eau (rivières, ruisseaux, torrents) avec le meilleur potentiel aurifère autour de la localisation donnée, dans un rayon de ${radius} km.

SOURCES À UTILISER :
- Données historiques d'orpaillage et de découvertes
- Mentions dans les forums spécialisés (chercheurs-or.fr, orpaillage-loisir.fr, etc.)
- Données BRGM si disponibles (présence de failles, quartz, roches favorables)
- Articles et publications scientifiques
- Témoignages de prospecteurs

INSTRUCTIONS POUR LES COURS D'EAU :
- Trouver les cours d'eau prometteurs dans les sources (forums, BRGM, etc.)
- Pour chaque cours d'eau trouvé, indiquer :
  * Son nom exact
  * Les villes/villages à proximité
  * Les points d'accès ou zones d'intérêt

LOCALISATION DES POINTS (CRITIQUE) :
- Pour chaque cours d'eau mentionné :
  * Rechercher le cours d'eau sur Google Maps avec les villes/villages indiqués
  * Placer le point DIRECTEMENT sur le cours d'eau, près des zones d'intérêt
  * Toujours vérifier que le point est bien sur la rivière elle-même
  * Les coordonnées doivent être précises et correspondre à un point sur le cours d'eau

ANALYSE DÉTAILLÉE (BRGM + SOURCES) :
Pour chaque cours d'eau, rechercher et inclure :
   
1. Données BRGM :
   * Cartes géologiques de la zone
   * Gîtes minéraux recensés
   * Anciennes exploitations aurifères
   * Filons de quartz aurifère
   
2. Origine de l'or :
   * Zones minéralisées traversées (selon BRGM)
   * Affluents enrichissants
   * Points d'entrée de l'or dans le cours d'eau
   
3. Spots historiques :
   * Zones d'orpaillage documentées
   * Points mentionnés dans les forums
   * Secteurs d'accumulation naturelle

FORMAT DE RÉPONSE REQUIS :
Ta réponse doit être un objet JSON valide avec la structure suivante :
{
  "mainSpots": [
    {
      "name": "Nom du cours d'eau (avec ville/village proche)",
      "type": "rivière/ruisseau/torrent",
      "coordinates": [latitude, longitude],
      "description": "Description détaillée du spot",
      "geology": "Description géologique (failles, quartz, roches)",
      "history": "Historique des découvertes",
      "rating": 5, // Note de 1 à 5 sur le potentiel aurifère
      "sources": ["Source 1", "Source 2"],
      "hotspots": [
        {
          "location": "Description précise du lieu (ex: 'Confluence avec le ruisseau X')",
          "description": "Pourquoi ce point précis est intéressant pour l'orpaillage",
          "source": "Source de l'information (BRGM, forum, etc.)"
        }
      ],
      "goldOrigin": {
        "description": "Explication détaillée de l'origine de l'or dans ce cours d'eau",
        "brgmData": "Données BRGM pertinentes (gîtes, filons, etc.)",
        "entryPoints": ["Point 1 où l'or entre dans le cours d'eau", "Point 2..."],
        "affluents": ["Affluent 1 qui apporte de l'or", "Affluent 2..."]
      },
      "referencedSpots": {
        "description": "Vue d'ensemble des spots connus",
        "locations": ["Spot 1 mentionné dans les forums/BRGM", "Spot 2..."],
        "sources": ["Source 1 pour ces spots", "Source 2..."]
      },
      "isMainSpot": true
    },
    // 2 autres spots principaux
  ],
  "secondarySpots": [
    // 3-5 spots secondaires avec le même format mais isMainSpot: false
  ]
}

IMPORTANT :
- Les 3 spots principaux doivent être les plus prometteurs
- Inclure 3-5 spots secondaires (petits cours d'eau, torrents)
- Attribuer une note objective basée sur les données disponibles
- Citer les sources utilisées pour chaque spot
- Pour chaque cours d'eau, identifier 1-3 "hotspots" (points d'intérêt spécifiques) :
  * Zones de confluence
  * Secteurs historiques
  * Zones géologiquement favorables (failles, quartz)
  * Spots mentionnés dans les forums
- Utiliser les données BRGM pour l'analyse géologique et l'origine de l'or
- Ne pas inclure de conseils de prospection
- Ta réponse doit être uniquement le JSON, sans texte avant ou après`
        },
        {
          role: "user",
          content: `Identifie les meilleurs spots pour l'orpaillage autour de ${city} dans un rayon de ${radius} km. Trouve les 3 cours d'eau principaux les plus prometteurs, ainsi que 3-5 cours d'eau secondaires (plus petits) qui pourraient aussi contenir de l'or. Pour chaque cours d'eau, indique les points précis (hotspots) les plus intéressants, l'origine de l'or selon les données BRGM, et les spots référencés dans la littérature ou les forums. IMPORTANT : Assure-toi que les coordonnées pointent exactement sur le cours d'eau.`
        }
      ],
      temperature: 0.7,
      max_tokens: 3500
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Pas de réponse de l'IA");
    }

    try {
      const parsedData = JSON.parse(content);
      
      // Vérifier la structure des données
      if (!parsedData.mainSpots || !Array.isArray(parsedData.mainSpots)) {
        throw new Error("Format de réponse invalide : 'mainSpots' manquant ou incorrect");
      }
      
      if (!parsedData.secondarySpots || !Array.isArray(parsedData.secondarySpots)) {
        throw new Error("Format de réponse invalide : 'secondarySpots' manquant ou incorrect");
      }
      
      // Valider chaque spot
      const validateSpot = (spot: any, index: number, isMain: boolean) => {
        if (!spot.name) {
          spot.name = isMain ? `Spot principal ${index + 1}` : `Spot secondaire ${index + 1}`;
        }
        
        if (!spot.coordinates || !Array.isArray(spot.coordinates)) {
          spot.coordinates = [0, 0]; // Coordonnées par défaut
        }
        
        // S'assurer que tous les champs requis sont présents
        spot.type = spot.type || "cours d'eau";
        spot.description = spot.description || "Aucune description disponible";
        spot.geology = spot.geology || "Aucune information géologique disponible";
        spot.history = spot.history || "Aucun historique disponible";
        spot.rating = spot.rating || 3;
        spot.sources = spot.sources || [];
        spot.hotspots = spot.hotspots || [];
        spot.isMainSpot = isMain;
      };
      
      parsedData.mainSpots.forEach((spot: any, index: number) => validateSpot(spot, index, true));
      parsedData.secondarySpots.forEach((spot: any, index: number) => validateSpot(spot, index, false));
      
      return {
        mainSpots: parsedData.mainSpots,
        secondarySpots: parsedData.secondarySpots
      };
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON:", parseError);
      
      // Fallback: créer un résultat par défaut
      const defaultResult: GoldSearchResult = {
        mainSpots: [{
          name: city,
          type: "rivière",
          coordinates: [0, 0],
          description: "Nous n'avons pas pu obtenir d'informations précises pour cette localisation. Essayez avec une ville plus connue ou une région aurifère comme 'Limousin', 'Cévennes', ou 'Ariège'.",
          geology: "Information non disponible",
          history: "Information non disponible",
          rating: 3,
          sources: [],
          hotspots: [{
            location: "Non disponible",
            description: "Aucune information sur les points d'intérêt spécifiques",
            source: "N/A"
          }],
          isMainSpot: true
        }],
        secondarySpots: []
      };
      
      return defaultResult;
    }
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    
    // Fallback: créer un résultat par défaut en cas d'erreur
    const defaultResult: GoldSearchResult = {
      mainSpots: [{
        name: city,
        type: "rivière",
        coordinates: [0, 0],
        description: "Une erreur s'est produite lors de la recherche. Veuillez réessayer ultérieurement ou essayer avec une autre localisation.",
        geology: "Information non disponible",
        history: "Information non disponible",
        rating: 3,
        sources: [],
        hotspots: [{
          location: "Non disponible",
          description: "Aucune information sur les points d'intérêt spécifiques",
          source: "N/A"
        }],
        isMainSpot: true
      }],
      secondarySpots: []
    };
    
    return defaultResult;
  }
}
