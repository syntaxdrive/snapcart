const Database = require('./Database');
const bcrypt = require('bcryptjs');

class User {
  constructor() {
    this.db = new Database('users.json');
  }

  async findOne(query) {
    return this.db.findOne(query);
  }

  async findById(id) {
    return this.db.findById(id);
  }

  async create(userData) {
    // Hash password before saving
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    return this.db.create(userData);
  }

  async find(query) {
    return this.db.find(query);
  }

  async count(query = {}) {
    return this.db.count(query);
  }

  async findByIdAndUpdate(id, updates) {
    return this.db.update(id, updates);
  }

  async findAll() {
    return this.db.find();
  }
}

module.exports = new User();