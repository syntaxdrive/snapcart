const Database = require('./Database');

class Report {
  constructor() {
    this.db = new Database('reports.json');
  }

  async findOne(query) {
    return this.db.findOne(query);
  }

  async findById(id) {
    return this.db.findById(id);
  }

  async create(reportData) {
    return this.db.create({
      ...reportData,
      createdAt: new Date().toISOString(),
      status: 'pending' // pending, reviewed, resolved
    });
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

  // Get reports for a specific user
  async findByReportedUser(userId) {
    return this.db.find({ reportedUserId: userId });
  }

  // Get reports by reporter
  async findByReporter(reporterId) {
    return this.db.find({ reporterId: reporterId });
  }
}

module.exports = new Report();