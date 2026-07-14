export type TUserLookupItem = {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
};

export type TProjectInviteMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  profileImage: string | null;
  status: "invited";
  invitedByUserId: string | null;
};

export type TMyProjectInvitation = {
  projectId: string;
  projectName: string;
  projectImageUrl: string | null;
  invitedAt: string;
  invitedBy: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
};
