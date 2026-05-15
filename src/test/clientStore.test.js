import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllClients,
  addClient,
  addVisit,
  searchClients,
  getClient,
  saveAnalysis,
} from '../services/clientStore';

// Reset localStorage before each test to keep tests isolated
beforeEach(() => {
  localStorage.clear();
});

describe('clientStore', () => {
  describe('getAllClients', () => {
    it('returns seed clients on first run', () => {
      const clients = getAllClients();
      expect(clients.length).toBeGreaterThanOrEqual(3);
    });

    it('every client has required fields', () => {
      getAllClients().forEach(c => {
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('name');
        expect(c).toHaveProperty('initials');
        expect(c).toHaveProperty('visits');
        expect(Array.isArray(c.visits)).toBe(true);
      });
    });
  });

  describe('addClient', () => {
    it('adds a new client to the store', () => {
      const before = getAllClients().length;
      addClient({ name: 'Test User', phone: '9999999999', email: 'test@test.com' });
      expect(getAllClients().length).toBe(before + 1);
    });

    it('generates correct initials', () => {
      const client = addClient({ name: 'Jane Doe' });
      expect(client.initials).toBe('JD');
    });

    it('new client starts with zero visits', () => {
      const client = addClient({ name: 'Fresh Client' });
      expect(client.visits.length).toBe(0);
    });

    it('prepends the new client so it appears first', () => {
      addClient({ name: 'Alpha Client' });
      const clients = getAllClients();
      expect(clients[0].name).toBe('Alpha Client');
    });
  });

  describe('getClient', () => {
    it('returns the client by id', () => {
      const added = addClient({ name: 'Lookup Me' });
      const found = getClient(added.id);
      expect(found).not.toBeNull();
      expect(found.name).toBe('Lookup Me');
    });

    it('returns null for a non-existent id', () => {
      expect(getClient('does-not-exist')).toBeNull();
    });
  });

  describe('searchClients', () => {
    it('finds clients by partial name (case-insensitive)', () => {
      addClient({ name: 'Priya Sharma' });
      const results = searchClients('priya');
      expect(results.some(c => c.name === 'Priya Sharma')).toBe(true);
    });

    it('returns empty array when no match', () => {
      const results = searchClients('zzznomatch');
      expect(results.length).toBe(0);
    });

    it('returns all clients for empty query', () => {
      const all = getAllClients();
      expect(searchClients('').length).toBe(all.length);
    });
  });

  describe('addVisit', () => {
    it('records a visit against the client', () => {
      const client = addClient({ name: 'Visit Tester' });
      addVisit(client.id, { service: 'Balayage', stylist: 'Aisha' });
      expect(getClient(client.id).visits.length).toBe(1);
    });

    it('visit contains the service name', () => {
      const client = addClient({ name: 'Service Tester' });
      addVisit(client.id, { service: 'Root Retouch', stylist: 'Priya' });
      expect(getClient(client.id).visits[0].service).toBe('Root Retouch');
    });

    it('returns null for unknown clientId', () => {
      expect(addVisit('bad-id', { service: 'Cut' })).toBeNull();
    });
  });

  describe('saveAnalysis', () => {
    it('saves analysis data to the client record', () => {
      const client = addClient({ name: 'Analysis Subject' });
      saveAnalysis(client.id, { hairType: 'Type 2A', porosity: 'Medium', confidence: 88 });
      const updated = getClient(client.id);
      expect(updated.lastAnalysis.hairType).toBe('Type 2A');
      expect(updated.lastAnalysis.confidence).toBe(88);
    });
  });
});
