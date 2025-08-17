const { query } = require('../config/database');

// Generate slug from text
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // Keep alphanumeric, spaces, Chinese characters, and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .substring(0, 200); // Limit length
};

// Generate unique slug
const generateUniqueSlug = async (text, tableName = 'projects', columnName = 'identifier', excludeId = null) => {
  const baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;

  // If slug is empty, use a timestamp
  if (!slug) {
    slug = `item-${Date.now()}`;
  }

  while (true) {
    // Check if slug exists
    let sql = `SELECT id FROM ${tableName} WHERE ${columnName} = ?`;
    const params = [slug];

    // Exclude current record when updating
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const existing = await query(sql, params);

    if (existing.length === 0) {
      // Slug is unique
      break;
    }

    // Generate new slug with counter
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Prevent infinite loop
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
};

// Validate slug format
const isValidSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Sanitize slug (ensure it follows the correct format)
const sanitizeSlug = (slug) => {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid characters with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

// Generate slug from Chinese text (with pinyin support if needed)
const generateChineseSlug = async (text, usePinyin = false) => {
  // For now, we'll use a simple approach
  // In production, you might want to use a pinyin library

  if (usePinyin) {
    // This would require a pinyin library like 'pinyin'
    // const pinyin = require('pinyin');
    // const pinyinText = pinyin(text, { style: pinyin.STYLE_NORMAL }).flat().join('-');
    // return generateSlug(pinyinText);
  }

  // Use timestamp-based slug for Chinese text
  const timestamp = Date.now();
  const hash = text.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return `project-${timestamp}-${hash % 1000}`;
};

// Batch generate unique slugs
const batchGenerateUniqueSlug = async (items, textField = 'title', tableName = 'projects') => {
  const slugs = [];

  for (const item of items) {
    const slug = await generateUniqueSlug(item[textField], tableName);
    slugs.push({
      ...item,
      slug
    });
  }

  return slugs;
};

module.exports = {
  generateSlug,
  generateUniqueSlug,
  isValidSlug,
  sanitizeSlug,
  generateChineseSlug,
  batchGenerateUniqueSlug
};
