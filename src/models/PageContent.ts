/**
 * PageContent Model
 * 
 * Stores generated page content as JSON objects
 * Each content object represents textual/structured content for a specific section
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';
import { v4 as uuidv4 } from 'uuid';
import { ContentJSON, SECTION_TYPES, SectionType } from '../types/page-content';

/**
 * PageContent attributes interface
 */
export interface PageContentAttributes {
  id: string;
  session_id: string;
  template_id: string;
  page_slug: string;
  section_type: SectionType;
  content_json: ContentJSON;  // Stored as JSON
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Optional attributes for creation
 */
interface PageContentCreationAttributes 
  extends Optional<PageContentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * PageContent Model class
 */
export class PageContent 
  extends Model<PageContentAttributes, PageContentCreationAttributes> 
  implements PageContentAttributes {
  public id!: string;
  public session_id!: string;
  public template_id!: string;
  public page_slug!: string;
  public section_type!: SectionType;
  public content_json!: ContentJSON;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate page slug format
 */
function isValidSlug(slug: string): boolean {
  return slug.startsWith('/') && slug.length > 0;
}

/**
 * Validate section type
 */
function isValidSectionType(type: string): type is SectionType {
  return SECTION_TYPES.includes(type as SectionType);
}

/**
 * Validate content JSON structure
 */
function validateContentJSON(value: unknown): void {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Content JSON must be an object');
  }
  
  // Basic validation - content should have at least one property
  const content = value as Record<string, unknown>;
  if (Object.keys(content).length === 0) {
    throw new Error('Content JSON cannot be empty');
  }
}

/**
 * Initialize PageContent model
 */
PageContent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        customValidator(value: string) {
          if (!isValidUUID(value)) {
            throw new Error('session_id must be a valid UUID format');
          }
        },
      },
    },
    template_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        customValidator(value: string) {
          if (!isValidUUID(value)) {
            throw new Error('template_id must be a valid UUID format');
          }
        },
      },
    },
    page_slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'page_slug cannot be empty',
        },
        customValidator(value: string) {
          if (!isValidSlug(value)) {
            throw new Error('page_slug must start with /');
          }
        },
      },
    },
    section_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'section_type cannot be empty',
        },
        customValidator(value: string) {
          if (!isValidSectionType(value)) {
            throw new Error(`section_type must be one of: ${SECTION_TYPES.join(', ')}`);
          }
        },
      },
    },
    content_json: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        customValidator(value: unknown) {
          validateContentJSON(value);
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'page_contents',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['session_id', 'template_id', 'page_slug', 'section_type'],
        name: 'unique_page_content',
      },
      {
        fields: ['session_id'],
        name: 'idx_page_content_session',
      },
      {
        fields: ['template_id'],
        name: 'idx_page_content_template',
      },
      {
        fields: ['session_id', 'template_id'],
        name: 'idx_page_content_session_template',
      },
    ],
  }
);

export default PageContent;
