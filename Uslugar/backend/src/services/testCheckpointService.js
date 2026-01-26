/**
 * Test Checkpoint & Rollback Service
 * 
 * Omogućuje kreiranje checkpoint-a baze i rollback na te točke.
 * Fleksibilan je - može se koristiti na svim tablicama ili samo na specifičnima.
 * 
 * Primjer korištenja:
 * 
 * // Kreiraj checkpoint (cijela baza ili samo određene tablice)
 * const checkpointId = await testCheckpoint.create('before_provider_registration', ['User', 'ProviderProfile']);
 * 
 * // Obavi testne radnje
 * // ... test code ...
 * 
 * // Vrati se na checkpoint
 * await testCheckpoint.rollback(checkpointId);
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHECKPOINT_DIR = path.join(__dirname, '../../.test-checkpoints');

// Kreiraj direktorij ako ne postoji
if (!fs.existsSync(CHECKPOINT_DIR)) {
  fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
}

class TestCheckpointService {
  constructor() {
    this.prisma = new PrismaClient();
    this.checkpoints = new Map(); // checkpointId -> { tables, timestamp, data }
    this._loadCheckpointsFromDisk();
  }

  /**
   * Učitaj sve checkpoint-e iz datoteka pri inicijalizaciji
   */
  _loadCheckpointsFromDisk() {
    try {
      if (!fs.existsSync(CHECKPOINT_DIR)) {
        return;
      }

      const files = fs.readdirSync(CHECKPOINT_DIR).filter(f => f.endsWith('.json'));
      console.log(`📋 Učitavam ${files.length} checkpoint-a iz datoteka...`);

      for (const file of files) {
        try {
          const filePath = path.join(CHECKPOINT_DIR, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const checkpoint = JSON.parse(fileContent);
          
          // Učitaj samo metadata (bez podataka) za brže učitavanje
          this.checkpoints.set(checkpoint.id, {
            id: checkpoint.id,
            name: checkpoint.name,
            tables: checkpoint.tables,
            timestamp: checkpoint.timestamp,
            description: checkpoint.description || null,
            purpose: checkpoint.purpose || null,
            data: null // Ne učitavamo podatke dok ne trebamo rollback
          });
        } catch (err) {
          console.warn(`⚠️  Greška pri učitavanju ${file}: ${err.message}`);
        }
      }

      console.log(`✅ Učitano ${this.checkpoints.size} checkpoint-a`);
    } catch (err) {
      console.error(`❌ Greška pri učitavanju checkpoint-a: ${err.message}`);
    }
  }

  /**
   * Kreiraj checkpoint za odabrane tablice
   * @param {string} name - Naziv checkpoint-a (npr. 'before_provider_reg')
   * @param {Array<string>} tables - Popis tablica za checkpoint (null = sve tablice)
   * @returns {string} checkpointId
   * 
   * Primjer:
   *   const id = await service.create('test1', ['User', 'Job', 'Offer']);
   *   const id = await service.create('test2', null); // sve tablice
   */
  async create(name, tables = null, description = null, purpose = null) {
    const checkpointId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📸 [CHECKPOINT] Kreiram checkpoint: ${checkpointId}`);
    console.log(`   Tablice: ${tables ? tables.join(', ') : 'SVE'}`);
    if (description) console.log(`   Opis: ${description}`);
    if (purpose) console.log(`   Svrha: ${purpose}`);
    
    try {
      // Ako tables nije specificiran, preuzmi sve tablice iz schema
      if (!tables) {
        tables = await this._getAllTables();
        console.log(`   Pronađeno ${tables.length} tablica`);
      }

      // Preuzmи podatke iz svake tablice
      const data = {};
      for (const table of tables) {
        try {
          const model = this.prisma[this._camelCase(table)];
          if (!model) {
            console.warn(`   ⚠️  Tablica ${table} nije pronađena u Prisma modelu, preskačem...`);
            continue;
          }
          data[table] = await model.findMany();
          console.log(`   ✓ Preuzeo ${data[table].length} redaka iz ${table}`);
        } catch (err) {
          console.warn(`   ⚠️  Greška pri preuzimanju ${table}: ${err.message}`);
        }
      }

      // Spremi checkpoint u memory i datoteku
      const checkpoint = {
        id: checkpointId,
        name,
        tables,
        timestamp: new Date().toISOString(),
        description: description || null,
        purpose: purpose || null,
        data
      };

      this.checkpoints.set(checkpointId, checkpoint);
      
      // Spremi u datoteku (za persistence)
      const filePath = path.join(CHECKPOINT_DIR, `${checkpointId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(checkpoint, null, 2));
      
      console.log(`✅ Checkpoint ${checkpointId} kreiran uspješno`);
      console.log(`   Datoteka: ${filePath}`);
      
      return checkpointId;
    } catch (err) {
      console.error(`❌ Greška pri kreiranju checkpointa: ${err.message}`);
      throw err;
    }
  }

  /**
   * Vrati bazu na stanje u определ checkpoint-u
   * @param {string} checkpointId - ID checkpoint-a
   * @returns {void}
   * 
   * Primjer:
   *   await service.rollback(checkpointId);
   */
  async rollback(checkpointId) {
    console.log(`⏪ [ROLLBACK] Vrati se na checkpoint: ${checkpointId}`);
    
    try {
      // Učitaj checkpoint iz memorije ili datoteke
      let checkpoint = this.checkpoints.get(checkpointId);
      
      if (!checkpoint || !checkpoint.data) {
        const filePath = path.join(CHECKPOINT_DIR, `${checkpointId}.json`);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          checkpoint = JSON.parse(fileContent);
          // Ažuriraj u memoriji
          this.checkpoints.set(checkpointId, checkpoint);
        } else {
          throw new Error(`Checkpoint ${checkpointId} nije pronađen`);
        }
      }

      const { tables, data } = checkpoint;
      
      console.log(`   Vraćam tablice: ${tables.join(', ')}`);

      // Za svaku tablicu: obriši sve i vrati checkpoint podatke
      for (const table of tables) {
        try {
          const model = this.prisma[this._camelCase(table)];
          if (!model) {
            console.warn(`   ⚠️  Tablica ${table} nije pronađena u Prisma modelu`);
            continue;
          }

          // Obriši sve redake iz tablice
          await model.deleteMany({});
          console.log(`   ✓ Obrisao sve redake iz ${table}`);

          // Vrati checkpoint podatke
          if (data[table] && data[table].length > 0) {
            // Koristi createMany ili create u petlji
            try {
              if (model.createMany) {
                await model.createMany({ data: data[table], skipDuplicates: true });
              } else {
                for (const row of data[table]) {
                  try {
                    await model.create({ data: row });
                  } catch (err) {
                    // Ignoriraj duplikate i strane ključeve
                    if (!err.message.includes('Unique constraint') && !err.message.includes('Foreign key')) {
                      console.warn(`   ⚠️  Greška pri vraćanju reda u ${table}: ${err.message}`);
                    }
                  }
                }
              }
              console.log(`   ✓ Vratio ${data[table].length} redaka u ${table}`);
            } catch (err) {
              console.warn(`   ⚠️  Greška pri vraćanju podataka u ${table}: ${err.message}`);
            }
          }
        } catch (err) {
          console.warn(`   ⚠️  Greška pri rollback-u za ${table}: ${err.message}`);
        }
      }

      console.log(`✅ Rollback ${checkpointId} uspješan`);
    } catch (err) {
      console.error(`❌ Greška pri rollback-u: ${err.message}`);
      throw err;
    }
  }

  /**
   * Obriši checkpoint
   * @param {string} checkpointId - ID checkpoint-a
   */
  async delete(checkpointId) {
    try {
      this.checkpoints.delete(checkpointId);
      const filePath = path.join(CHECKPOINT_DIR, `${checkpointId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.log(`🗑️  Checkpoint ${checkpointId} obrisan`);
    } catch (err) {
      console.error(`❌ Greška pri brisanju checkpointa: ${err.message}`);
    }
  }

  /**
   * Prikazi sve dostupne checkpoint-e
   */
  listCheckpoints() {
    const list = Array.from(this.checkpoints.values()).map(cp => ({
      id: cp.id,
      name: cp.name,
      tables: cp.tables,
      timestamp: cp.timestamp,
      description: cp.description || null,
      purpose: cp.purpose || null
    }));
    
    console.log('📋 Dostupni checkpoint-i:');
    list.forEach(cp => {
      console.log(`   - ${cp.id} (${cp.name})`);
      console.log(`     Tablice: ${cp.tables.join(', ')}`);
      if (cp.description) console.log(`     Opis: ${cp.description}`);
      if (cp.purpose) console.log(`     Svrha: ${cp.purpose}`);
    });
    
    return list;
  }

  // --- PRIVATNE METODE ---

  /**
   * Preuzmi sve tablice iz baze
   */
  async _getAllTables() {
    // Koristi Prisma schema za dohvat modela
    const models = Object.keys(this.prisma)
      .filter(key => {
        const model = this.prisma[key];
        return model && 
               typeof model === 'object' && 
               typeof model.findMany === 'function' &&
               !key.startsWith('_');
      });
    return models;
  }

  /**
   * Pretvori camelCase u naziv Prisma modela
   */
  _camelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const testCheckpointService = new TestCheckpointService();

