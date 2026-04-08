const PHOTOS_API = "https://photoslibrary.googleapis.com/v1";

export interface MediaItem {
  id: string;
  filename: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
  };
}

export interface ListMediaItemsResponse {
  mediaItems?: MediaItem[];
  nextPageToken?: string;
}

export async function searchMediaItems(
  accessToken: string,
  startDate: string, // "YYYY-MM-DD"
  endDate: string,
  pageToken?: string
): Promise<ListMediaItemsResponse> {
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);

  const body: Record<string, unknown> = {
    pageSize: 100,
    filters: {
      dateFilter: {
        ranges: [
          {
            startDate: { year: sy, month: sm, day: sd },
            endDate: { year: ey, month: em, day: ed },
          },
        ],
      },
      mediaTypeFilter: { mediaTypes: ["PHOTO"] },
    },
  };

  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(`${PHOTOS_API}/mediaItems:search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Photos API error ${res.status}: ${text}`);
  }

  return res.json();
}

/** Fetch full-resolution bytes for a media item */
export async function downloadMediaItem(
  accessToken: string,
  baseUrl: string
): Promise<ArrayBuffer> {
  // Append =d to get the full download
  const res = await fetch(`${baseUrl}=d`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to download media item: ${res.status}`);
  return res.arrayBuffer();
}
