/**
 * Template Model
 * 
 * Represents website templates with metadata for matching against requirements
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Template attributes interface
 */
export interface TemplateAttributes {
  id: string;
  name: string;
  business_types: string[];
  supported_features: string[];
  design_tags: string[];
  description: string;
  preview_image_url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Optional attributes for template creation
 */
interface TemplateCreationAttributes extends Optional<TemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Template Model class
 */
export class Template extends Model<TemplateAttributes, TemplateCreationAttributes> implements TemplateAttributes {
  public id!: string;
  public name!: string;
  public business_types!: string[];
  public supported_features!: string[];
  public design_tags!: string[];
  public description!: string;
  public preview_image_url!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Initialize Template model
 */
Template.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: (): string => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Template name cannot be empty',
        },
      },
    },
    business_types: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidArray(value: unknown): void {
          if (!Array.isArray(value)) {
            throw new Error('business_types must be an array');
          }
          if (value.length === 0) {
            throw new Error('business_types cannot be empty');
          }
          if (!value.every((item) => typeof item === 'string')) {
            throw new Error('All business_types must be strings');
          }
        },
        isLowercaseTrimmed(value: unknown): void {
          if (Array.isArray(value)) {
            value.forEach((item: string) => {
              if (item !== item.toLowerCase().trim()) {
                throw new Error('All business_types must be lowercase and trimmed');
              }
            });
          }
        },
      },
    },
    supported_features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidArray(value: unknown): void {
          if (!Array.isArray(value)) {
            throw new Error('supported_features must be an array');
          }
          if (value.length === 0) {
            throw new Error('supported_features cannot be empty');
          }
          if (!value.every((item) => typeof item === 'string')) {
            throw new Error('All supported_features must be strings');
          }
        },
        isLowercaseTrimmed(value: unknown): void {
          if (Array.isArray(value)) {
            value.forEach((item: string) => {
              if (item !== item.toLowerCase().trim()) {
                throw new Error('All supported_features must be lowercase and trimmed');
              }
            });
          }
        },
      },
    },
    design_tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidArray(value: unknown): void {
          if (!Array.isArray(value)) {
            throw new Error('design_tags must be an array');
          }
          if (value.length === 0) {
            throw new Error('design_tags cannot be empty');
          }
          if (!value.every((item) => typeof item === 'string')) {
            throw new Error('All design_tags must be strings');
          }
        },
        isLowercaseTrimmed(value: unknown): void {
          if (Array.isArray(value)) {
            value.forEach((item: string) => {
              if (item !== item.toLowerCase().trim()) {
                throw new Error('All design_tags must be lowercase and trimmed');
              }
            });
          }
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Description cannot be empty',
        },
      },
    },
    preview_image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Preview image URL cannot be empty',
        },
        isUrl: {
          msg: 'Preview image URL must be a valid URL',
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'templates',
    timestamps: true,
  }
);
