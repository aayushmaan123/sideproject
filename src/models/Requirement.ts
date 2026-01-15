/**
 * Requirement model with versioning support
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

// Requirement attributes interface
export interface RequirementAttributes {
  id: string;
  session_id: string;
  business_type: string;
  key_features: string[];
  target_audience: string;
  design_preferences: string;
  additional_notes: string;
  extracted_at: Date;
  version_number: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface RequirementCreationAttributes
  extends Optional<RequirementAttributes, 'id' | 'version_number' | 'createdAt' | 'updatedAt'> {}

/**
 * Requirement Model
 * Stores website requirements with versioning
 */
export class Requirement
  extends Model<RequirementAttributes, RequirementCreationAttributes>
  implements RequirementAttributes
{
  declare id: string;
  declare session_id: string;
  declare business_type: string;
  declare key_features: string[];
  declare target_audience: string;
  declare design_preferences: string;
  declare additional_notes: string;
  declare extracted_at: Date;
  declare version_number: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Initialize model
Requirement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: true,
      },
    },
    business_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    key_features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidArray(value: unknown): void {
          if (!Array.isArray(value)) {
            throw new Error('key_features must be an array');
          }
          if (value.some((item) => typeof item !== 'string')) {
            throw new Error('key_features must be an array of strings');
          }
        },
      },
    },
    target_audience: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    design_preferences: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    additional_notes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    extracted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    modelName: 'Requirement',
    tableName: 'requirements',
    timestamps: true,
    indexes: [
      {
        fields: ['session_id'],
      },
      {
        fields: ['session_id', 'version_number'],
        unique: true,
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Requirement;
