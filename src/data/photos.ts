export interface Photo {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
  category?: string;
}

export const photos: Photo[] = [
  {
    id: 1,
    src: 'https://picsum.photos/1600/2400?random=1',
    alt: 'Urban Lights at Night',
    width: 2400,
    height: 1600,
    category: 'Urban'
  },
  {
    id: 2,
    src: 'https://picsum.photos/1600/2400?random=2',
    alt: 'Street Life',
    width: 2400,
    height: 1600,
    category: 'Street'
  },
  {
    id: 3,
    src: 'https://picsum.photos/1600/2400?random=3',
    alt: 'Natural Light Portrait',
    width: 1600,
    height: 2400,
    category: 'Portrait'
  },
  {
    id: 4,
    src: 'https://picsum.photos/1600/2400?random=4',
    alt: 'Mountain Vista',
    width: 2400,
    height: 1600,
    category: 'Landscape'
  },
  {
    id: 5,
    src: 'https://picsum.photos/1600/2400?random=5',
    alt: 'City Architecture',
    width: 2400,
    height: 1600,
    category: 'Urban'
  }
]; 