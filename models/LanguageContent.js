const database = require('../config/database');

class LanguageContent {
  constructor() {
    this.prisma = database.getClient();
  }

  // Create language content
  async create(contentData) {
    try {
      return await this.prisma.languageContent.create({
        data: contentData,
        select: {
          content_id: true,
          content_key: true,
          language: true,
          content_value: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create language content: ${error.message}`);
    }
  }

  // Create multiple language content entries
  async createMany(contentDataArray) {
    try {
      return await this.prisma.languageContent.createMany({
        data: contentDataArray,
        skipDuplicates: true,
      });
    } catch (error) {
      throw new Error(`Failed to create language content: ${error.message}`);
    }
  }

  // Upsert language content
  async upsert(contentKey, language, contentValue) {
    try {
      return await this.prisma.languageContent.upsert({
        where: {
          content_key_language: {
            content_key: contentKey,
            language: language,
          },
        },
        update: { content_value: contentValue },
        create: {
          content_key: contentKey,
          language: language,
          content_value: contentValue,
        },
        select: {
          content_id: true,
          content_key: true,
          language: true,
          content_value: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to upsert language content: ${error.message}`);
    }
  }

  // Find content by key and language
  async findByKeyAndLanguage(contentKey, language) {
    try {
      return await this.prisma.languageContent.findUnique({
        where: {
          content_key_language: {
            content_key: contentKey,
            language: language,
          },
        },
        select: {
          content_id: true,
          content_key: true,
          language: true,
          content_value: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find language content: ${error.message}`);
    }
  }

  // Get all content for a language
  async findByLanguage(language) {
    try {
      return await this.prisma.languageContent.findMany({
        where: { language: language.toUpperCase() },
        select: {
          content_key: true,
          content_value: true,
        },
        orderBy: {
          content_key: 'asc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to find language content: ${error.message}`);
    }
  }

  // Get all content for a language as object
  async getLanguageContentObject(language) {
    try {
      const content = await this.findByLanguage(language);
      
      return content.reduce((acc, item) => {
        acc[item.content_key] = item.content_value;
        return acc;
      }, {});
    } catch (error) {
      throw new Error(`Failed to get language content object: ${error.message}`);
    }
  }

  // Get all content
  async findAll() {
    try {
      return await this.prisma.languageContent.findMany({
        select: {
          content_id: true,
          content_key: true,
          language: true,
          content_value: true,
        },
        orderBy: [
          { language: 'asc' },
          { content_key: 'asc' },
        ],
      });
    } catch (error) {
      throw new Error(`Failed to find language content: ${error.message}`);
    }
  }

  // Update content
  async update(contentId, updateData) {
    try {
      return await this.prisma.languageContent.update({
        where: { content_id: contentId },
        data: updateData,
        select: {
          content_id: true,
          content_key: true,
          language: true,
          content_value: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update language content: ${error.message}`);
    }
  }

  // Update content by key and language
  async updateByKeyAndLanguage(contentKey, language, contentValue) {
    try {
      return await this.prisma.languageContent.update({
        where: {
          content_key_language: {
            content_key: contentKey,
            language: language,
          },
        },
        data: { content_value: contentValue },
        select: {
          content_id: true,
          content_key: true,
          language: true,
          content_value: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update language content: ${error.message}`);
    }
  }

  // Delete content
  async delete(contentId) {
    try {
      return await this.prisma.languageContent.delete({
        where: { content_id: contentId },
      });
    } catch (error) {
      throw new Error(`Failed to delete language content: ${error.message}`);
    }
  }

  // Delete content by key and language
  async deleteByKeyAndLanguage(contentKey, language) {
    try {
      return await this.prisma.languageContent.delete({
        where: {
          content_key_language: {
            content_key: contentKey,
            language: language,
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete language content: ${error.message}`);
    }
  }

  // Get available languages
  async getAvailableLanguages() {
    try {
      const languages = await this.prisma.languageContent.findMany({
        select: {
          language: true,
        },
        distinct: ['language'],
        orderBy: {
          language: 'asc',
        },
      });

      return languages.map(item => item.language);
    } catch (error) {
      throw new Error(`Failed to get available languages: ${error.message}`);
    }
  }

  // Get content keys
  async getContentKeys() {
    try {
      const keys = await this.prisma.languageContent.findMany({
        select: {
          content_key: true,
        },
        distinct: ['content_key'],
        orderBy: {
          content_key: 'asc',
        },
      });

      return keys.map(item => item.content_key);
    } catch (error) {
      throw new Error(`Failed to get content keys: ${error.message}`);
    }
  }

  // Count content
  async count(whereConditions = {}) {
    try {
      return await this.prisma.languageContent.count({
        where: whereConditions,
      });
    } catch (error) {
      throw new Error(`Failed to count language content: ${error.message}`);
    }
  }

  // Get content statistics
  async getStats() {
    try {
      const [totalContent, contentByLanguage] = await Promise.all([
        this.prisma.languageContent.count(),
        this.prisma.languageContent.groupBy({
          by: ['language'],
          _count: {
            content_key: true,
          },
        }),
      ]);

      return {
        totalContent,
        contentByLanguage: contentByLanguage.reduce((acc, item) => {
          acc[item.language] = item._count.content_key;
          return acc;
        }, {}),
      };
    } catch (error) {
      throw new Error(`Failed to get content statistics: ${error.message}`);
    }
  }
}

module.exports = new LanguageContent();
