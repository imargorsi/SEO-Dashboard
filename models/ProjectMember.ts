import mongoose, { Schema, type InferSchemaType, type Model, type Types } from "mongoose";

import { PROJECT_MEMBER_STATUSES } from "@/lib/projects/constants";

const projectMemberSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    status: { type: String, enum: PROJECT_MEMBER_STATUSES, required: true, default: "active" },
  },
  { timestamps: true },
);

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });
projectMemberSchema.index({ userId: 1, status: 1 });

export type ProjectMemberDocument = InferSchemaType<typeof projectMemberSchema> &
  mongoose.Document & {
    projectId: Types.ObjectId;
    userId: Types.ObjectId;
    roleId: Types.ObjectId;
    status: (typeof PROJECT_MEMBER_STATUSES)[number];
  };

export const ProjectMember: Model<ProjectMemberDocument> =
  mongoose.models.ProjectMember ??
  mongoose.model<ProjectMemberDocument>("ProjectMember", projectMemberSchema);
