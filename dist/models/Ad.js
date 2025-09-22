const Database = require('./Database');

class Ad {
  constructor() {
    this.db = new Database('ads.json');
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

  async create(adData) {
    return this.db.create(adData);
  }

  async update(id, updates) {
    return this.db.update(id, updates);
  }

  async delete(id) {
    return this.db.delete(id);
  }

  // Get active ads for display
  async getActiveAds() {
    const ads = await this.find({ active: true });
    return ads.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  // Get ads for carousel (top priority ads)
  async getCarouselAds() {
    const ads = await this.getActiveAds();
    return ads.filter(ad => ad.displayType === 'carousel').slice(0, 5); // Max 5 carousel ads
  }

  // Get ads for popups (lower priority or specific popup ads)
  async getPopupAds() {
    const ads = await this.getActiveAds();
    return ads.filter(ad => ad.displayType === 'popup');
  }
}

module.exports = new Ad();