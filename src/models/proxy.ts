import mongoose, { Schema, Document } from "mongoose";

export interface IProxyDetails extends Document {
  host: string;
  port: string;
  username: string;
  password: string;
  isUsed: boolean;
}

const proxyDetailsSchema = new Schema<IProxyDetails>({
  host: { type: String, required: true },
  port: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  isUsed: { type: Boolean, required: true },
});

const Proxy = mongoose.model<IProxyDetails>("ProxyDetails", proxyDetailsSchema);

export default Proxy;
