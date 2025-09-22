const Database = require('./Database');

class Post {
  constructor() {
    this.db = new Database('posts.json');
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

  async create(postData) {
    return this.db.create(postData);
  }

  async update(id, updates) {
    return this.db.update(id, updates);
  }

  async delete(id) {
    return this.db.delete(id);
  }

  // Get posts for feed (with pagination)
  async getFeedPosts(page = 1, limit = 10) {
    const posts = await this.find({ active: true });
    // Sort by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      posts: posts.slice(startIndex, endIndex),
      currentPage: page,
      totalPages: Math.ceil(posts.length / limit),
      hasNext: endIndex < posts.length,
      hasPrev: page > 1
    };
  }

  // Get posts by user
  async getUserPosts(userId, page = 1, limit = 10) {
    const posts = await this.find({ authorId: userId, active: true });
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      posts: posts.slice(startIndex, endIndex),
      currentPage: page,
      totalPages: Math.ceil(posts.length / limit),
      hasNext: endIndex < posts.length,
      hasPrev: page > 1
    };
  }

  // Add like to post
  async addLike(postId, userId) {
    const post = await this.findById(postId);
    if (!post) return null;

    if (!post.likes) post.likes = [];
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await this.update(postId, { likes: post.likes });
    }

    return post;
  }

  // Remove like from post
  async removeLike(postId, userId) {
    const post = await this.findById(postId);
    if (!post) return null;

    if (post.likes) {
      post.likes = post.likes.filter(id => id !== userId);
      await this.update(postId, { likes: post.likes });
    }

    return post;
  }

  // Add comment to post
  async addComment(postId, commentData) {
    const post = await this.findById(postId);
    if (!post) return null;

    if (!post.comments) post.comments = [];
    post.comments.push({
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...commentData,
      createdAt: new Date().toISOString()
    });

    await this.update(postId, { comments: post.comments });
    return post;
  }

  // Delete comment from post
  async deleteComment(postId, commentId, userId) {
    const post = await this.findById(postId);
    if (!post) return null;

    if (post.comments) {
      post.comments = post.comments.filter(comment =>
        comment._id !== commentId || comment.authorId !== userId
      );
      await this.update(postId, { comments: post.comments });
    }

    return post;
  }
}

module.exports = new Post();