const PICKER_API = "https://photospicker.googleapis.com/v1";

export interface PickerSession {
  id: string;
  pickerUri: string;
  pollingConfig: {
    pollInterval: string;
    timeoutIn: string;
  };
  mediaItemsSet: boolean;
  expireTime: string;
}

export interface PickerMediaItem {
  id: string;
  createTime: string;
  type: string;
  mediaFile: {
    baseUrl: string;
    mimeType: string;
    filename: string;
    mediaFileMetadata?: {
      width?: number;
      height?: number;
    };
  };
}

export interface ListPickerMediaItemsResponse {
  mediaItems?: PickerMediaItem[];
  nextPageToken?: string;
}

export async function createPickerSession(accessToken: string): Promise<PickerSession> {
  const res = await fetch(`${PICKER_API}/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create picker session ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getPickerSession(
  accessToken: string,
  sessionId: string
): Promise<PickerSession> {
  const res = await fetch(`${PICKER_API}/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get picker session ${res.status}: ${text}`);
  }
  return res.json();
}

export async function listPickerMediaItems(
  accessToken: string,
  sessionId: string,
  pageToken?: string
): Promise<ListPickerMediaItemsResponse> {
  const params = new URLSearchParams({ sessionId, pageSize: "100" });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(`${PICKER_API}/mediaItems?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list picker media items ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deletePickerSession(
  accessToken: string,
  sessionId: string
): Promise<void> {
  await fetch(`${PICKER_API}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function downloadMediaItem(
  accessToken: string,
  baseUrl: string
): Promise<ArrayBuffer> {
  const res = await fetch(`${baseUrl}=d`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to download media item: ${res.status}`);
  return res.arrayBuffer();
}
