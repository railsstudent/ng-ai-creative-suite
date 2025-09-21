export type Image = {
  id: number;
  url: string;
}

export type ImageDownloadEvent = {
  imageUrl: string;
  index: number;
}
