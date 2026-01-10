/**
 * Utility functions for building category tree structures
 */

/**
 * Build a hierarchical tree structure from flat category list
 * @param {Array} categories - Flat array of categories
 * @returns {Array} - Tree structure with nested children
 */
export function buildCategoryTree(categories) {
  // Create a map for quick lookup
  const categoryMap = new Map();
  const rootCategories = [];

  // First pass: create map and initialize all categories
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: []
    });
  });

  // Second pass: build tree structure
  categories.forEach(cat => {
    const categoryNode = categoryMap.get(cat.id);
    
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(categoryNode);
      } else {
        // Parent not found, treat as root
        rootCategories.push(categoryNode);
      }
    } else {
      // Root category (no parent)
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
}

/**
 * Flatten a category tree to a flat array
 * @param {Array} tree - Tree structure
 * @param {Array} result - Accumulator array
 * @returns {Array} - Flat array
 */
export function flattenCategoryTree(tree, result = []) {
  tree.forEach(cat => {
    result.push(cat);
    if (cat.children && cat.children.length > 0) {
      flattenCategoryTree(cat.children, result);
    }
  });
  return result;
}

/**
 * Find category by ID in tree structure
 * @param {Array} tree - Tree structure
 * @param {String} categoryId - Category ID to find
 * @returns {Object|null} - Category or null
 */
export function findCategoryInTree(tree, categoryId) {
  for (const cat of tree) {
    if (cat.id === categoryId) {
      return cat;
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryInTree(cat.children, categoryId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all descendants (children, grandchildren, etc.) of a category
 * @param {Array} tree - Tree structure
 * @param {String} categoryId - Category ID
 * @returns {Array} - Array of descendant category IDs
 */
export function getCategoryDescendants(tree, categoryId) {
  const category = findCategoryInTree(tree, categoryId);
  if (!category || !category.children) return [];
  
  const descendants = [];
  
  function traverse(node) {
    node.children.forEach(child => {
      descendants.push(child.id);
      if (child.children && child.children.length > 0) {
        traverse(child);
      }
    });
  }
  
  traverse(category);
  return descendants;
}

