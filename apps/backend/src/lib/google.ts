import axios from 'axios';

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
