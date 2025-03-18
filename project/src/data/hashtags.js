// Define hashtags with their types
export const hashtags = [

];

// Export just the hashtag names for backward compatibility
export const hashtagNames = hashtags.map(tag => tag.name);

// Export restaurant and blog hashtags separately
export const restaurantHashtags = hashtags
  .filter(tag => tag.type === 'restaurant' || tag.type === 'both')
  .map(tag => tag.name);

export const blogHashtags = hashtags
  .filter(tag => tag.type === 'blog' || tag.type === 'both')
  .map(tag => tag.name);