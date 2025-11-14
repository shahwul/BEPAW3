/**
 * Format MongoDB document to use 'id' instead of '_id'
 */
const formatResponse = (doc) => {
  if (!doc) return null;
  
  if (Array.isArray(doc)) {
    return doc.map(item => formatSingleDoc(item));
  }
  
  return formatSingleDoc(doc);
};

const formatSingleDoc = (doc) => {
  if (!doc) return null;
  
  // Convert Mongoose document to plain object if needed
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Create new object with 'id' instead of '_id'
  const formatted = {};
  
  for (const key in obj) {
    if (key === '_id') {
      formatted.id = obj[key];
    } else if (obj[key] && typeof obj[key] === 'object') {
      if (Array.isArray(obj[key])) {
        // Handle arrays of objects
        formatted[key] = obj[key].map(item => {
          if (item && typeof item === 'object' && item._id) {
            return formatSingleDoc(item);
          }
          return item;
        });
      } else if (obj[key]._id) {
        // Handle nested populated objects
        formatted[key] = formatSingleDoc(obj[key]);
      } else {
        formatted[key] = obj[key];
      }
    } else {
      formatted[key] = obj[key];
    }
  }
  
  return formatted;
};

module.exports = { formatResponse, formatSingleDoc };
