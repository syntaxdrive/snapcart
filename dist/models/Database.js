const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class JSONDatabase {
  constructor(filename) {
    this.filepath = path.join(__dirname, '..', 'data', filename);
    this.ensureDataDirectory();
    this.loadData();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.filepath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  loadData() {
    try {
      if (fs.existsSync(this.filepath)) {
        const data = fs.readFileSync(this.filepath, 'utf8');
        this.data = JSON.parse(data);
      } else {
        this.data = [];
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = [];
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  find(query = {}) {
    return this.data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  findOne(query = {}) {
    return this.data.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  findById(id) {
    return this.data.find(item => item._id === id);
  }

  count(query = {}) {
    return this.find(query).length;
  }

  create(item) {
    const newItem = {
      _id: uuidv4(),
      ...item,
      createdAt: new Date().toISOString()
    };
    this.data.push(newItem);
    this.saveData();
    return newItem;
  }

  update(id, updates) {
    const index = this.data.findIndex(item => item._id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates };
      this.saveData();
      return this.data[index];
    }
    return null;
  }

  delete(id) {
    const index = this.data.findIndex(item => item._id === id);
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }

  // For populating references (simple implementation)
  populate(items, refField, refCollection) {
    return items.map(item => {
      if (item[refField]) {
        const refItem = refCollection.findById(item[refField]);
        if (refItem) {
          return { ...item, [refField.replace('Id', '')]: refItem };
        }
      }
      return item;
    });
  }
}

module.exports = JSONDatabase;