import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import subcategories from '../../prisma/seeds/subcategories.cjs';
import { buildCategoryTree } from '../utils/category-tree.js';

const r = Router();

// list all categories (public)
r.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '1000', 10), 1000);
    const { tree, flat } = req.query;
    
    const categories = await prisma.category.findMany({
      take: limit,
      include: {
        parent: true,
        children: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    // If tree=true, return hierarchical structure
    if (tree === 'true') {
      const categoryTree = buildCategoryTree(categories);
      return res.json(categoryTree);
    }

    // Default: return flat array (backward compatible)
    res.json(categories);
  } catch (e) { next(e); }
});

// get single category
r.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (e) { next(e); }
});

// seed subcategories endpoint
r.post('/seed-subcategories', async (req, res, next) => {
  try {
    console.log('🌱 Početak seed-a podkategorija...');
    let createdCount = 0;
    let skippedCount = 0;

    for (const subcategoryData of subcategories) {
      try {
        // Pronađi roditeljsku kategoriju
        const parentCategory = await prisma.category.findFirst({
          where: { name: subcategoryData.parentName },
        });

        if (!parentCategory) {
          console.warn(`Roditeljska kategorija "${subcategoryData.parentName}" nije pronađena za podkategoriju "${subcategoryData.name}". Preskačem.`);
          skippedCount++;
          continue;
        }

        const existingSubcategory = await prisma.category.findFirst({
          where: { name: subcategoryData.name, parentId: parentCategory.id },
        });

        if (!existingSubcategory) {
          await prisma.category.create({
            data: {
              name: subcategoryData.name,
              description: subcategoryData.description,
              icon: subcategoryData.icon,
              isActive: subcategoryData.isActive,
              parentId: parentCategory.id,
            },
          });
          console.log(`✅ Kreirana podkategorija: ${subcategoryData.name} (Roditelj: ${parentCategory.name})`);
          createdCount++;
        } else {
          console.log(`⏩ Podkategorija već postoji: ${subcategoryData.name} (Roditelj: ${parentCategory.name})`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Greška pri kreiranju podkategorije "${subcategoryData.name}": `, error);
        skippedCount++;
      }
    }

    console.log('🌱 Seed podkategorija završen.');
    res.json({
      success: true,
      message: 'Seed podkategorija završen',
      created: createdCount,
      skipped: skippedCount,
      total: subcategories.length
    });
  } catch (e) { 
    console.error('❌ Greška u seed endpoint-u:', e);
    next(e); 
  }
});

export default r;
