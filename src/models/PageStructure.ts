/**
 * PageStructure Model
 * 
 * Stores generated page structures as JSON blobs
 * Each structure represents a complete website blueprint
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';
import { v4 as uuidv4 } from 'uuid';
import { PageStructureData, Page, Section } from '../types/page-structure';

/**
 * PageStructure attributes interface
 */
export interface PageStructureAttributes {
  id: string;
  session_id: string;
  template_id: string;
  structure: PageStructureData;  // Stored as JSON
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Optional attributes for creation
 */
interface PageStructureCreationAttributes 
  extends Optional<PageStructureAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * PageStructure Model class
 */
export class PageStructure 
  extends Model<PageStructureAttributes, PageStructureCreationAttributes> 
  implements PageStructureAttributes {
  public id!: string;
  public session_id!: string;
  public template_id!: string;
  public structure!: PageStructureData;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Validate page structure data
 */
function validatePageStructure(value: unknown): void {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Page structure must be an object');
  }

  const structure = value as PageStructureData;

  // Validate session_id
  if (!structure.session_id || typeof structure.session_id !== 'string') {
    throw new Error('Page structure must have a valid session_id');
  }

  // Validate template_id
  if (!structure.template_id || typeof structure.template_id !== 'string') {
    throw new Error('Page structure must have a valid template_id');
  }

  // Validate pages array
  if (!Array.isArray(structure.pages)) {
    throw new Error('Pages must be an array');
  }

  if (structure.pages.length === 0) {
    throw new Error('Pages array cannot be empty');
  }

  // Validate each page
  structure.pages.forEach((page: Page, index: number) => {
    if (!page.page_id || typeof page.page_id !== 'string') {
      throw new Error(`Page ${index} must have a valid page_id`);
    }
    if (!page.name || typeof page.name !== 'string') {
      throw new Error(`Page ${index} must have a valid name`);
    }
    if (!page.slug || typeof page.slug !== 'string') {
      throw new Error(`Page ${index} must have a valid slug`);
    }
    if (!page.slug.startsWith('/')) {
      throw new Error(`Page ${index} slug must start with /`);
    }
    if (!Array.isArray(page.sections)) {
      throw new Error(`Page ${index} sections must be an array`);
    }

    // Validate each section
    page.sections.forEach((section: Section, sIndex: number) => {
      if (!section.section_id || typeof section.section_id !== 'string') {
        throw new Error(`Page ${index}, Section ${sIndex} must have a valid section_id`);
      }
      if (!section.type || typeof section.type !== 'string') {
        throw new Error(`Page ${index}, Section ${sIndex} must have a valid type`);
      }
      if (typeof section.order !== 'number' || section.order < 1) {
        throw new Error(`Page ${index}, Section ${sIndex} must have a valid order >= 1`);
      }
      if (!Array.isArray(section.required_features)) {
        throw new Error(`Page ${index}, Section ${sIndex} required_features must be an array`);
      }
      if (typeof section.content_hints !== 'string') {
        throw new Error(`Page ${index}, Section ${sIndex} content_hints must be a string`);
      }
    });
  });

  // Validate generated_at
  if (!structure.generated_at) {
    throw new Error('Page structure must have generated_at timestamp');
  }
}

/**
 * Initialize PageStructure model
 */
PageStructure.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: (): string => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: true,
      },
    },
    template_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: true,
      },
    },
    structure: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidStructure(value: unknown): void {
          validatePageStructure(value);
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'page_structures',
    timestamps: true,
    indexes: [
      {
        fields: ['session_id'],
      },
      {
        fields: ['template_id'],
      },
      {
        fields: ['session_id', 'template_id'],
        unique: true,
      },
    ],
  }
);

export default PageStructure;
