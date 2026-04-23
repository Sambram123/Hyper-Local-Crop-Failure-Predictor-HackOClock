import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysisCache extends Document {
  district: string;
  crop: string;
  growthStage: string;
  result: Record<string, any>;
  cachedAt: Date;
  expiresAt: Date;
}

const AnalysisCacheSchema: Schema = new Schema({
  district: { type: String, required: true },
  crop: { type: String, required: true },
  growthStage: { type: String, required: true },
  result: { type: Schema.Types.Mixed, required: true },
  cachedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// TTL index to automatically delete expired cache documents
AnalysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast lookups
AnalysisCacheSchema.index({ district: 1, crop: 1, growthStage: 1 }, { unique: true });

export default mongoose.model<IAnalysisCache>('AnalysisCache', AnalysisCacheSchema);
