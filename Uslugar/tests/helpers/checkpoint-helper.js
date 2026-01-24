/**
 * Checkpoint Helper za Playwright testove
 * Omogućuje lakšu upotrebu checkpoint/rollback mehanizma u testima
 */

export class CheckpointHelper {
  constructor(apiUrl = 'http://localhost:3000/api') {
    this.apiUrl = apiUrl;
    this.checkpoints = [];
  }

  /**
   * Kreiraj checkpoint
   * @param {string} name - Naziv checkpoint-a
   * @param {Array<string>} tables - Tablice za checkpoint (null = sve)
   * @returns {string} checkpointId
   */
  async create(name, tables = null) {
    try {
      const res = await fetch(`${this.apiUrl}/testing/checkpoint/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tables })
      });

      if (!res.ok) {
        throw new Error(`API greška: ${res.status}`);
      }

      const data = await res.json();
      const checkpointId = data.checkpointId;
      
      // Spremi checkpoint ID za kasnije (cleanup)
      this.checkpoints.push(checkpointId);
      
      console.log(`📸 [CHECKPOINT] ${name} kreiran: ${checkpointId}`);
      console.log(`   Tablice: ${tables ? tables.join(', ') : 'SVE'}`);
      
      return checkpointId;
    } catch (err) {
      console.error(`❌ Greška pri kreiranju checkpointa: ${err.message}`);
      throw err;
    }
  }

  /**
   * Vrati bazu na checkpoint
   * @param {string} checkpointId - ID checkpoint-a
   */
  async rollback(checkpointId) {
    try {
      const res = await fetch(`${this.apiUrl}/testing/checkpoint/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpointId })
      });

      if (!res.ok) {
        throw new Error(`API greška: ${res.status}`);
      }

      console.log(`⏪ [ROLLBACK] ${checkpointId} uspješan`);
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
      const res = await fetch(`${this.apiUrl}/testing/checkpoint/${checkpointId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error(`API greška: ${res.status}`);
      }

      // Ukloni iz liste
      this.checkpoints = this.checkpoints.filter(id => id !== checkpointId);
      
      console.log(`🗑️  [CLEANUP] Checkpoint obrisan`);
    } catch (err) {
      console.warn(`⚠️  Nije uspjelo obrisati checkpoint: ${err.message}`);
    }
  }

  /**
   * Cleanup - obriši sve kreirane checkpoint-e
   */
  async cleanup() {
    for (const checkpointId of this.checkpoints) {
      await this.delete(checkpointId);
    }
    console.log(`✅ Svi checkpoint-i očišćeni`);
  }

  /**
   * Prikazi sve dostupne checkpoint-e
   */
  async list() {
    try {
      const res = await fetch(`${this.apiUrl}/testing/checkpoints`);
      const data = await res.json();
      return data.checkpoints || [];
    } catch (err) {
      console.error(`❌ Greška pri dohvaćanju checkpoint-a: ${err.message}`);
      return [];
    }
  }
}

/**
 * Setup checkpoint za test
 * Koristi se s Playwright beforeAll/afterAll hook-ovima
 * 
 * Primjer:
 * 
 * test.beforeAll(async () => {
 *   checkpoint = new CheckpointHelper();
 *   checkpointId = await checkpoint.create('my_test', ['User', 'Job']);
 * });
 * 
 * test.afterEach(async () => {
 *   await checkpoint.rollback(checkpointId);
 * });
 * 
 * test.afterAll(async () => {
 *   await checkpoint.cleanup();
 * });
 */
export function setupCheckpointTesting(test, apiUrl = 'http://localhost:3000/api') {
  let helper = new CheckpointHelper(apiUrl);

  test.afterAll(async () => {
    await helper.cleanup();
  });

  return helper;
}

