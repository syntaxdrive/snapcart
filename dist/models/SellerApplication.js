const Database = require('./Database');

class SellerApplication {
  constructor() {
    this.db = new Database('seller-applications.json');
  }

  async find(query = {}) {
    return this.db.find(query);
  }

  async findOne(query = {}) {
    return this.db.findOne(query);
  }

  async findById(id) {
    return this.db.findById(id);
  }

  async create(applicationData) {
    return this.db.create(applicationData);
  }

  async update(id, updates) {
    return this.db.update(id, updates);
  }

  async delete(id) {
    return this.db.delete(id);
  }

  // Get applications by status
  async getByStatus(status) {
    return this.find({ status });
  }

  // Get application by user ID
  async getByUserId(userId) {
    return this.findOne({ userId });
  }

  // Get pending applications
  async getPendingApplications() {
    return this.getByStatus('pending');
  }

  // Get approved applications
  async getApprovedApplications() {
    return this.getByStatus('approved');
  }

  // Get rejected applications
  async getRejectedApplications() {
    return this.getByStatus('rejected');
  }

  // Get applications by university
  async getByUniversity(university) {
    return this.find({ university, status: 'approved' });
  }

  // Get all universities with approved sellers
  async getUniversitiesWithSellers() {
    const approvedApplications = await this.getApprovedApplications();
    const universities = [...new Set(approvedApplications.map(app => app.university))];
    return universities.sort();
  }

  // Get approved sellers for a specific university
  async getApprovedSellersByUniversity(university) {
    return this.find({ university, status: 'approved' });
  }
}

module.exports = new SellerApplication();