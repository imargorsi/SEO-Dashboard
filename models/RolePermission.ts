import mongoose, { Schema, type InferSchemaType, type Model, type Types } from "mongoose";

const rolePermissionSchema = new Schema(
  {
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true, index: true },
    permissionId: { type: Schema.Types.ObjectId, ref: "Permission", required: true, index: true },
  },
  { timestamps: false },
);

rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export type RolePermissionDocument = InferSchemaType<typeof rolePermissionSchema> & mongoose.Document;

export const RolePermission: Model<RolePermissionDocument> =
  mongoose.models.RolePermission ??
  mongoose.model<RolePermissionDocument>("RolePermission", rolePermissionSchema);

const userRoleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true, index: true },
  },
  { timestamps: false },
);

userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

export type UserRoleDocument = InferSchemaType<typeof userRoleSchema> & mongoose.Document & {
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
};

export const UserRole: Model<UserRoleDocument> =
  mongoose.models.UserRole ?? mongoose.model<UserRoleDocument>("UserRole", userRoleSchema);

const userPermissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    permissionId: { type: Schema.Types.ObjectId, ref: "Permission", required: true, index: true },
  },
  { timestamps: false },
);

userPermissionSchema.index({ userId: 1, permissionId: 1 }, { unique: true });

export type UserPermissionDocument = InferSchemaType<typeof userPermissionSchema> &
  mongoose.Document;

export const UserPermission: Model<UserPermissionDocument> =
  mongoose.models.UserPermission ??
  mongoose.model<UserPermissionDocument>("UserPermission", userPermissionSchema);
