export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-TW').format(num);
};

export const formatPrice = (price: number | string): string => {
  if (!price) return '價格待定';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '價格待定';
  
  if (numPrice >= 100000000) {
    return `${(numPrice / 100000000).toFixed(1)} 億`;
  } else if (numPrice >= 10000) {
    return `${formatNumber(Math.floor(numPrice / 10000))} 萬`;
  }
  return formatNumber(numPrice);
};

export const formatArea = (area: string | number): string => {
  if (!area) return '-';
  const numArea = typeof area === 'string' ? parseFloat(area) : area;
  return `${formatNumber(numArea)} 坪`;
};

export const formatFloorPlan = (floorPlan: string): string => {
  if (!floorPlan) return '-';
  return floorPlan;
};

export const formatDate = (date: string | Date): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};