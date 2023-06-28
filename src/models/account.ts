import { Document, Schema, model } from "mongoose";

enum ActionType {
  LIKE = "LIKE",
  FOLLOW = "FOLLOW",
  BLOCK = "BLOCK",
  BIO_UPDATE = "BIO_UPDATE",
  MEDIA_UPLOAD = "MEDIA_UPLOAD",
}

interface Action {
  action_type: ActionType;
  count?: number;
  sessions?: number;
  start_time?: string;
}

interface WarmupConfiguration {
  day_of_week: string;
  actions: Action[];
}

interface SessionAction {
  action_id: string;
  action_type: ActionType;
  target_usernames?: string[];
}

interface Session {
  session_id: string;
  start_time: string;
  end_time: string;
  actions: SessionAction[];
}

interface DailyAction {
  date: string;
  sessions: Session[];
}

interface Account extends Document {
  username: string;
  password: string;
  email: string;
  followers: number;
  following: number;
  posts: number;
  last_login: Date;
  created_at: Date;
  warmup_phase: boolean;
  warmup_configuration: WarmupConfiguration[];
  daily_actions: DailyAction[];
}

const accountSchema = new Schema<Account>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  posts: { type: Number, default: 0 },
  last_login: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  warmup_phase: { type: Boolean, default: true },
  warmup_configuration: [
    {
      day_of_week: { type: String, required: true },
      actions: [
        {
          action_type: { type: String, enum: ActionType, required: true },
          count: { type: Number, default: Math.floor(Math.random() * 10) + 1 },
          sessions: {
            type: Number,
            default: Math.floor(Math.random() * 5) + 1,
          },
          start_time: { type: String, default: new Date().toISOString() },
        },
      ],
    },
  ],
  daily_actions: [
    {
      date: { type: String, required: true },
      sessions: [
        {
          session_id: { type: String, required: true },
          start_time: { type: String, default: new Date().toISOString() },
          end_time: { type: String, default: new Date().toISOString() },
          actions: [
            {
              action_id: { type: String, required: true },
              action_type: { type: String, enum: ActionType, required: true },
              target_usernames: { type: [String], default: [] },
            },
          ],
        },
      ],
    },
  ],
});
const AccountModel = model<Account>("Account", accountSchema);

export {
  AccountModel,
  Account,
  Action,
  WarmupConfiguration,
  SessionAction,
  Session,
  DailyAction,
  ActionType,
};
