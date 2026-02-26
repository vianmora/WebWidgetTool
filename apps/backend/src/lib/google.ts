import axios from 'axios';

export interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export async function searchPlaces(query: string): Promise<PlacePrediction[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY non configurée.');

  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/place/autocomplete/json',
    {
      params: {
        input: query,
        key: apiKey,
        language: 'fr',
        types: 'establishment',
      },
    }
  );

  if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${response.data.status}`);
  }

  return (response.data.predictions || []).map((p: any) => ({
    place_id: p.place_id,
    description: p.description,
    main_text: p.structured_formatting?.main_text ?? p.description,
    secondary_text: p.structured_formatting?.secondary_text ?? '',
  }));
}

export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
  relative_time_description: string;
}

export async function fetchGoogleReviews(
  placeId: string,
  apiKey: string,
  language = 'fr'
): Promise<GoogleReview[]> {
  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/place/details/json',
    {
      params: {
        place_id: placeId,
        fields: 'name,rating,reviews',
        key: apiKey,
        language,
      },
    }
  );

  if (response.data.status !== 'OK') {
    throw new Error(`Google Places API error: ${response.data.status}`);
  }

  return response.data.result?.reviews || [];
}
