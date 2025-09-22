const Database = require('./Database');

class Product {
  constructor() {
    this.db = new Database('products.json');
  }

  async find(query = {}) {
    const products = this.db.find(query);
    // Simple populate implementation
    if (query.seller) {
      return products; // Already filtered by seller
    }
    return products;
  }

  async findById(id) {
    return this.db.findById(id);
  }

  async create(productData) {
    return this.db.create(productData);
  }

  async findByIdAndDelete(id) {
    return this.db.delete(id);
  }

  async findByIdAndUpdate(id, updates) {
    return this.db.update(id, updates);
  }

  // Custom method to get products with seller info
  async findWithSeller() {
    const products = this.db.data.filter(product => !product.hidden);
    const User = require('./User');

    // Populate seller information
    const populatedProducts = await Promise.all(
      products.map(async (product) => {
        const seller = await User.findById(product.seller);
        return {
          ...product,
          seller: seller ? {
            _id: seller._id,
            name: seller.name,
            email: seller.email,
            whatsapp: seller.whatsapp
          } : null
        };
      })
    );

    return populatedProducts;
  }

  // Get products by seller
  async findBySeller(sellerId) {
    return this.db.find({ seller: sellerId });
  }

  async count(query = {}) {
    return this.db.count(query);
  }
}

module.exports = new Product();