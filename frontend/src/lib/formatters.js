export const formatOrderNumber = (orderId, dateString) => {
  if (!orderId) return "N/A";
  
  // Parse date or extract from MongoDB ObjectId
  let date = dateString ? new Date(dateString) : new Date();
  
  if (!dateString && orderId.length === 24) {
    try {
      date = new Date(parseInt(orderId.substring(0, 8), 16) * 1000);
    } catch(e) {}
  }

  if (isNaN(date.getTime())) {
    date = new Date();
  }

  const year = date.getFullYear().toString().slice(-2);
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = date.getDate().toString().padStart(2, '0');
  
  // Last 4 characters of ID for uniqueness
  const uniqueStr = orderId.substring(orderId.length - 4).toUpperCase();
  
  return `${year}${month}${day}-${uniqueStr}`;
};
