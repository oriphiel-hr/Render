/**
 * Frontend utility functions for category tree handling
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

  // Sort children alphabetically
  function sortChildren(node) {
    if (node.children && node.children.length > 0) {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach(child => sortChildren(child));
    }
  }

  rootCategories.forEach(root => sortChildren(root));
  rootCategories.sort((a, b) => a.name.localeCompare(b.name));

  return rootCategories;
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
  if (!category || !category.children || category.children.length === 0) return [];
  
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
 * Format category name with indentation for display
 * @param {Object} category - Category object
 * @param {Number} depth - Current depth in tree
 * @returns {String} - Formatted category name
 */
export function formatCategoryName(category, depth = 0) {
  const indent = '  '.repeat(depth);
  return `${indent}${category.icon || ''} ${category.name}`;
}

