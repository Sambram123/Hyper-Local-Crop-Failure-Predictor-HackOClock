import mongoose, { Schema, Document } from 'mongoose';

export interface ICropKnowledge extends Document {
  crop: string;
  stages: {
    name: string;
    durationDays: number;
    droughtSensitivity: 'low' | 'medium' | 'high' | 'critical';
    pestWindow: boolean;
    commonPests: string[];
    nutrientDemand: {
      N: 'low' | 'medium' | 'high';
      P: string;
      K: string;
    };
    tempRange: {
      min: number;
      max: number;
    };
    rainfallRange: {
      min: number;
      max: number;
    };
    weights: {
      drought: number;
      pest: number;
      nutrient: number;
    };
  }[];
  karnatakaSeason: 'kharif' | 'rabi' | 'both';
  sowingMonths: number[];
}

const CropKnowledgeSchema: Schema = new Schema({
  crop: { type: String, required: true, unique: true },
  stages: [{
    name: { type: String, required: true },
    durationDays: { type: Number, required: true },
    droughtSensitivity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    pestWindow: { type: Boolean, required: true },
    commonPests: [{ type: String }],
    nutrientDemand: {
      N: { type: String, enum: ['low', 'medium', 'high'], required: true },
      P: { type: String, required: true },
      K: { type: String, required: true }
    },
    tempRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    rainfallRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    weights: {
      drought: { type: Number, required: true },
      pest: { type: Number, required: true },
      nutrient: { type: Number, required: true }
    }
  }],
  karnatakaSeason: { type: String, enum: ['kharif', 'rabi', 'both'], required: true },
  sowingMonths: [{ type: Number }]
}, {
  timestamps: true
});

export default mongoose.model<ICropKnowledge>('CropKnowledge', CropKnowledgeSchema);
