const crypto = require('crypto');

function nowIso() {
  return new Date().toISOString();
}

function createMemoryRepository() {
  const users = [];
  const projects = [];

  return {
    kind: 'memory',
    users: {
      async create(data) {
        const doc = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: nowIso(),
        };
        users.push(doc);
        return doc;
      },
      async findByEmail(email) {
        const needle = String(email || '').toLowerCase();
        return users.find((u) => u.email.toLowerCase() === needle) || null;
      },
      async findByUsername(username) {
        const needle = String(username || '').toLowerCase();
        return users.find((u) => u.username === needle) || null;
      },
      async findById(id) {
        return users.find((u) => u.id === id) || null;
      },
      async count() {
        return users.length;
      },
    },
    projects: {
      async create(data) {
        const doc = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        projects.push(doc);
        return doc;
      },
      async update(id, data) {
        const index = projects.findIndex((p) => p.id === id);
        if (index === -1) return null;
        projects[index] = { ...projects[index], ...data, updatedAt: nowIso() };
        return projects[index];
      },
      async remove(id) {
        const index = projects.findIndex((p) => p.id === id);
        if (index === -1) return false;
        projects.splice(index, 1);
        return true;
      },
      async findById(id) {
        return projects.find((p) => p.id === id) || null;
      },
      async list() {
        return [...projects].sort((a, b) => String(b.shippedAt).localeCompare(String(a.shippedAt)));
      },
      async findByOwner(ownerId) {
        return projects
          .filter((p) => p.ownerId === ownerId)
          .sort((a, b) => String(b.shippedAt).localeCompare(String(a.shippedAt)));
      },
    },
  };
}

module.exports = { createMemoryRepository };
