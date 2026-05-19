export const formatLkr = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 2,
  }).format(amount);
};
