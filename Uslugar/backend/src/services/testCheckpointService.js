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

/**
 * Polja za prikaz po tablici (delta i summary).
 * Prisma model names su camelCase (user, job, apiRequestLog, itd.)
 */
const KEY_FIELDS = {
  user: ['id', 'email', 'fullName', 'role', 'isVerified', 'phone', 'createdAt'],
  providerProfile: ['id', 'userId', 'companyName', 'bio', 'ratingAvg', 'createdAt'],
  supportTicket: ['id', 'userId', 'subject', 'status', 'createdAt'],
  whiteLabel: ['id', 'userId', 'companyName', 'createdAt'],
  category: ['id', 'name', 'slug', 'parentId'],
  job: ['id', 'title', 'status', 'userId', 'categoryId', 'city', 'createdAt'],
  offer: ['id', 'jobId', 'userId', 'amount', 'status', 'createdAt'],
  review: ['id', 'jobId', 'fromUserId', 'toUserId', 'rating', 'createdAt'],
  notification: ['id', 'userId', 'type', 'title', 'read', 'createdAt'],
  chatRoom: ['id', 'jobId', 'createdAt'],
  chatMessage: ['id', 'roomId', 'senderId', 'body', 'createdAt'],
  subscription: ['id', 'userId', 'planId', 'status', 'createdAt'],
  subscriptionPlan: ['id', 'name', 'price', 'interval'],
  invoice: ['id', 'userId', 'amount', 'status', 'createdAt'],
  legalStatus: ['id', 'name', 'slug'],
  testPlan: ['id', 'name', 'createdAt'],
  testItem: ['id', 'planId', 'title', 'testId', 'testType'],
  documentationCategory: ['id', 'name', 'slug'],
  documentationFeature: ['id', 'categoryId', 'title', 'slug'],
  clientVerification: ['id', 'userId', 'status', 'createdAt'],
  smsLog: ['id', 'phone', 'type', 'status', 'mode', 'twilioSid', 'error', 'createdAt'],
  apiRequestLog: ['id', 'method', 'path', 'statusCode', 'userId', 'ipAddress', 'userAgent', 'responseTime', 'errorMessage', 'requestBody', 'responseBody', 'createdAt'],
  errorLog: ['id', 'userId', 'level', 'message', 'endpoint', 'createdAt'],
  auditLog: ['id', 'action', 'entityType', 'entityId', 'userId', 'createdAt'],
  leadQueue: ['id', 'jobId', 'providerId', 'status', 'createdAt'],
  creditTransaction: ['id', 'userId', 'type', 'amount', 'createdAt'],
  jobAlert: ['id', 'userId', 'name', 'isActive', 'createdAt'],
  savedSearch: ['id', 'userId', 'name', 'createdAt'],
  testRun: ['id', 'testId', 'status', 'createdAt']
};

/**
 * Tablice koje mogu imati jako puno redaka – u checkpointu i getCurrentStateSummary
 * dohvaćamo samo zadnjih BIG_TABLE_ROW_LIMIT redaka (po id desc) da ne pucamo memoriju i disk.
 * Rollback za te tablice vraća samo taj ograničeni set (ostalo se briše).
 */
const BIG_TABLES = new Set(['apiRequestLog', 'errorLog', 'smsLog', 'auditLog', 'chatMessage', 'notification']);
const BIG_TABLE_ROW_LIMIT = 5000;

/** Broj redaka po batch-u kod upisa (createMany); smanjuje veličinu transakcije i timeout rizik. */
const INSERT_BATCH_SIZE = 500;

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

      // Preuzmi podatke iz svake tablice (velike tablice: samo zadnjih BIG_TABLE_ROW_LIMIT redaka)
      const data = {};
      const totalTables = tables.length;
      const startCreate = Date.now();
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        try {
          const model = this.prisma[this._camelCase(table)];
          if (!model) {
            console.warn(`   ⚠️  Tablica ${table} nije pronađena u Prisma modelu, preskačem...`);
            continue;
          }
          data[table] = await this._fetchTableData(model, table);
          const limitNote = BIG_TABLES.has(table) ? ` (limit ${data[table].length})` : '';
          console.log(`   ✓ [${i + 1}/${totalTables}] ${table}: ${data[table].length} redaka${limitNote}`);
        } catch (err) {
          console.warn(`   ⚠️  Greška pri preuzimanju ${table}: ${err.message}`);
        }
      }
      console.log(`   ⏱️  Checkpoint create: ${((Date.now() - startCreate) / 1000).toFixed(1)}s`);

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

  _getRollbackOrder(tables) {
    // Redoslijed: roditelji prije djece (za INSERT). DELETE koristi reverse.
    const INSERT_FIRST = [
      'legalStatus', 'category', 'subscriptionPlan', 'featureCatalog', 'documentationCategory',
      'user', 'providerProfile', 'providerTeamLocation', 'supportTicket', 'whiteLabel',
      'job', 'offer', 'review', 'chatRoom', 'notification', 'chatMessage', 'messageVersion',
      'subscription', 'trialEngagement', 'subscriptionHistory', 'addonSubscription', 'addonUsage', 'addonEventLog',
      'invoice', 'leadPurchase', 'billingPlan', 'billingAdjustment', 'companyFeatureOwnership', 'featureOwnershipHistory',
      'providerROI', 'creditTransaction', 'clientVerification', 'providerLicense', 'leadQueue', 'companyLeadQueue',
      'testPlan', 'testItem', 'testRun', 'testRunItem', 'documentationFeature',
      'auditLog', 'smsLog', 'pushSubscription', 'messageSLA', 'chatbotSession', 'savedSearch', 'jobAlert',
      'apiRequestLog', 'errorLog'
    ];
    const tableSet = new Set(tables);
    const ordered = [];
    for (const t of INSERT_FIRST) {
      if (tableSet.has(t)) { ordered.push(t); tableSet.delete(t); }
    }
    for (const t of tableSet) ordered.push(t);
    return ordered;
  }

  _parseRowForPrisma(row) {
    const out = { ...row };
    for (const k of Object.keys(out)) {
      const v = out[k];
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
        out[k] = new Date(v);
      }
    }
    return out;
  }

  async rollback(checkpointId) {
    console.log(`⏪ [ROLLBACK] Vrati se na checkpoint: ${checkpointId}`);
    try {
      let checkpoint = this.checkpoints.get(checkpointId);
      if (!checkpoint || !checkpoint.data) {
        const filePath = path.join(CHECKPOINT_DIR, `${checkpointId}.json`);
        if (fs.existsSync(filePath)) {
          checkpoint = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          this.checkpoints.set(checkpointId, checkpoint);
        } else {
          throw new Error(`Checkpoint ${checkpointId} nije pronađen`);
        }
      }
      const { tables, data } = checkpoint;
      const deleteOrder = [...this._getRollbackOrder(tables)].reverse();
      const insertOrder = this._getRollbackOrder(tables);
      const startRollback = Date.now();
      const totalSteps = deleteOrder.length + insertOrder.length;
      let step = 0;

      await this.prisma.$transaction(async (tx) => {
        for (const table of deleteOrder) {
          step++;
          const model = tx[this._camelCase(table)];
          if (!model) continue;
          const deleted = await model.deleteMany({});
          if (deleted?.count > 0) {
            console.log(`   ✓ [${step}/${totalSteps}] Obrisano ${deleted.count} redaka iz ${table}`);
          }
        }
        for (const table of insertOrder) {
          step++;
          const rows = data[table];
          if (!rows || rows.length === 0) continue;
          const model = tx[this._camelCase(table)];
          if (!model) continue;
          const parsed = rows.map(r => this._parseRowForPrisma(r));
          const batches = this._chunk(parsed, INSERT_BATCH_SIZE);
          for (let b = 0; b < batches.length; b++) {
            await model.createMany({ data: batches[b], skipDuplicates: true });
            if (batches.length > 1) {
              const soFar = (b + 1) * batches[b].length;
              console.log(`   ✓ [${step}/${totalSteps}] ${table}: batch ${b + 1}/${batches.length} (${soFar}/${parsed.length} redaka)`);
            } else {
              console.log(`   ✓ [${step}/${totalSteps}] Vraćeno ${parsed.length} redaka u ${table}`);
            }
          }
        }
      });
      console.log(`✅ Rollback ${checkpointId} uspješan (${((Date.now() - startRollback) / 1000).toFixed(1)}s)`);
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
   * Dohvati sažetak checkpointa - broj redaka po tablici i ključni podaci za prikaz
   * @param {string} checkpointId
   * @returns {Object} { tables: { TableName: { count, records: [{id, ...keyFields}] } } }
   */
  getCheckpointSummary(checkpointId) {
    try {
      let checkpoint = this.checkpoints.get(checkpointId);
      if (!checkpoint || !checkpoint.data) {
        const filePath = path.join(CHECKPOINT_DIR, `${checkpointId}.json`);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          checkpoint = JSON.parse(fileContent);
        } else {
          return null;
        }
      }
      return this._summarizeData(checkpoint.data);
    } catch (err) {
      console.error(`[CHECKPOINT] getCheckpointSummary error: ${err.message}`);
      return null;
    }
  }

  /**
   * Dohvati trenutno stanje baze (isti format kao checkpoint summary)
   * @param {Array<string>} tables - tablice
   */
  async getCurrentStateSummary(tables) {
    try {
      if (!tables || tables.length === 0) {
        tables = await this._getAllTables();
      }
      const data = {};
      for (const table of tables) {
        try {
          const model = this.prisma[this._camelCase(table)];
          if (!model) continue;
          data[table] = await this._fetchTableData(model, table);
        } catch (err) {
          console.warn(`[CHECKPOINT] getCurrentState ${table}: ${err.message}`);
        }
      }
      return this._summarizeData(data, true);
    } catch (err) {
      console.error(`[CHECKPOINT] getCurrentStateSummary error: ${err.message}`);
      return null;
    }
  }

  /**
   * Izračunaj razliku između checkpointa i trenutnog stanja (što je test dodao)
   * @param {Object} checkpointSummary
   * @param {Object} currentSummary - mora imati fullRecords za točan delta
   * @returns {Object} { tables: { TableName: { beforeCount, afterCount, added, newRecords } } }
   */
  computeDelta(checkpointSummary, currentSummary) {
    if (!checkpointSummary || !currentSummary) return null;
    const delta = {};
    for (const table of Object.keys(currentSummary.tables || {})) {
      const beforeIds = new Set(checkpointSummary.tables?.[table]?.recordIds || []);
      const afterTable = currentSummary.tables?.[table] || { count: 0, fullRecords: [], records: [] };
      const fullRecords = afterTable.fullRecords || afterTable.records || [];
      const newRecords = fullRecords.filter(r => r.id && !beforeIds.has(r.id));
      if (newRecords.length > 0 || (checkpointSummary.tables?.[table]?.count ?? 0) !== afterTable.count) {
        const fields = KEY_FIELDS[table] || ['id'];
        delta[table] = {
          beforeCount: checkpointSummary.tables?.[table]?.count ?? 0,
          afterCount: afterTable.count,
          added: newRecords.length,
          newRecords: newRecords.slice(0, 10).map(r => {
            const rec = {};
            for (const f of fields) {
              if (r[f] !== undefined) rec[f] = r[f] instanceof Date ? r[f].toISOString() : r[f];
            }
            return rec;
          })
        };
      }
    }
    return Object.keys(delta).length > 0 ? delta : null;
  }

  _summarizeData(data, includeFullRecords = false) {
    const tables = {};
    for (const [table, rows] of Object.entries(data)) {
      const keyFields = KEY_FIELDS[table] || ['id'];
      const records = (rows || []).slice(0, 10).map(r => {
        const rec = {};
        for (const f of keyFields) {
          if (r[f] !== undefined) {
            rec[f] = r[f] instanceof Date ? r[f].toISOString() : r[f];
          }
        }
        return rec;
      });
      const recordIds = (rows || []).map(r => r.id).filter(Boolean);
      const out = { count: (rows || []).length, records, recordIds };
      if (includeFullRecords) {
        out.fullRecords = (rows || []).map(r => {
          const rec = {};
          for (const f of keyFields) {
            if (r[f] !== undefined) rec[f] = r[f] instanceof Date ? r[f].toISOString() : r[f];
          }
          return rec;
        });
      }
      tables[table] = out;
    }
    return { tables };
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
   * Podijeli niz u podnizove veličine size (za batch upis).
   */
  _chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) {
      out.push(arr.slice(i, i + size));
    }
    return out;
  }

  /**
   * Dohvati podatke tablice. Za velike tablice (BIG_TABLES) vraća samo zadnjih BIG_TABLE_ROW_LIMIT redaka.
   * @param {object} model - Prisma model
   * @param {string} tableName - Naziv tablice (PascalCase npr. apiRequestLog)
   */
  async _fetchTableData(model, tableName) {
    const camel = this._camelCase(tableName);
    if (BIG_TABLES.has(camel)) {
      return model.findMany({
        orderBy: { id: 'desc' },
        take: BIG_TABLE_ROW_LIMIT
      });
    }
    return model.findMany();
  }

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

