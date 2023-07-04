import { Document, Schema, model } from "mongoose";

enum ActionType {
  LIKE = "LIKE",
  FOLLOW = "FOLLOW",
  BLOCK = "BLOCK",
  BIO_UPDATE = "BIO_UPDATE",
  MEDIA_UPLOAD = "MEDIA_UPLOAD",
}

interface WarmupSession {
  session_id: string;
  count: number;
  start_time: string;
  end_time: string;
}

interface WarmupAction {
  action_type: ActionType;
  sessions: WarmupSession[];
}

interface WarmupConfiguration {
  day_of_week: string;
  actions: WarmupAction[];
}

interface IAccount extends Document {
  username: string;
  password: string;
  phoneNumber: string;
  createdTimestamp: Date;
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

const accountSchema = new Schema<IAccount>({
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
          action_type: {
            type: String,
            enum: Object.values(ActionType),
            required: true,
          },
          sessions: [
            {
              session_id: { type: String, required: true },
              count: { type: Number, required: true },
              start_time: { type: String, required: true },
              end_time: { type: String, required: true },
            },
          ],
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
              action_type: {
                type: String,
                enum: Object.values(ActionType),
                required: true,
              },
              target_usernames: { type: [String], default: [] },
            },
          ],
        },
      ],
    },
  ],
});

const AccountModel = model<IAccount>("Account", accountSchema);

export {
  AccountModel,
  IAccount,
  ActionType,
  WarmupConfiguration,
  WarmupAction,
  WarmupSession,
  DailyAction,
  Session,
  SessionAction,
};
