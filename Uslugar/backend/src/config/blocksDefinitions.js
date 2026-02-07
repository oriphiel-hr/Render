/**
 * Definicije blokova - prema docs/blocks/blocks.yaml
 * Svaki blok = logička cjelina (API + URL + metoda)
 */
export const BLOCK_DEFINITIONS = {
  login: {
    inputs: { from: [] },
    outputs: ['userId', 'token'],
    api: { method: 'POST', path: '/auth/login' },
    auth: { required: false }
  },
  'create-job': {
    inputs: { from: ['login'], inherit: ['userId'] },
    outputs: ['jobId'],
    api: { method: 'POST', path: '/jobs' },
    db: { output: { Job: { id: 'jobId' } } },
    frontend: { url: '#user', trigger: 'form submit' }
  },
  'view-job-detail': {
    inputs: { from: ['create-job'], inherit: ['jobId'] },
    outputs: ['jobId'],
    frontend: { url: '#user', stateAfter: { selectedJobId: 'jobId' } }
  },
  'send-offer': {
    inputs: { from: ['create-job', 'login'], inherit: ['jobId', 'userId'] },
    outputs: ['jobId', 'offerId'],
    api: { method: 'POST', path: '/offers' },
    db: { input: { Job: { id: 'jobId' } }, output: { Offer: { id: 'offerId', jobId: 'jobId' } } },
    auth: { required: true, role: 'PROVIDER' }
  },
  'fetch-categories': {
    inputs: { from: [] },
    outputs: ['categories'],
    api: { method: 'GET', path: '/categories' }
  },
  'register-user': {
    inputs: { from: [] },
    outputs: ['userId'],
    api: { method: 'POST', path: '/api/auth/register' },
    frontend: { url: '#register', trigger: 'form submit' },
    sideEffects: { email: true }
  },
  'register-provider': {
    inputs: { from: [] },
    outputs: ['userId', 'providerId'],
    api: { method: 'POST', path: '/api/auth/register' },
    frontend: { url: '#register-provider', trigger: 'form submit' },
    sideEffects: { email: true }
  },
  'filter-jobs-by-category': {
    inputs: { from: ['login', 'fetch-categories'], inherit: ['token', 'categories'] },
    outputs: [],
    api: { method: 'GET', path: '/jobs' }
  },
  'create-job-with-budget': {
    inputs: { from: ['login'], inherit: ['userId'] },
    outputs: ['jobId'],
    api: { method: 'POST', path: '/jobs' },
    params: ['budgetMin', 'budgetMax']
  }
}
