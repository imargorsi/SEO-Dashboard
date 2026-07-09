import { describe, expect, it } from "vitest";

import { serializeProfileImageUrl } from "@/lib/serializers/profile-image";

describe("serializeProfileImageUrl", () => {
  it("returns null for empty values", () => {
    expect(serializeProfileImageUrl(null)).toBeNull();
    expect(serializeProfileImageUrl(undefined)).toBeNull();
    expect(serializeProfileImageUrl("")).toBeNull();
  });

  it("maps local storage paths to /storage URLs", () => {
    expect(serializeProfileImageUrl("profile-images/user-1/avatar.jpg")).toBe(
      "http://localhost:3000/storage/profile-images/user-1/avatar.jpg",
    );
  });

  it("returns external URLs unchanged", () => {
    const url = "https://cdn.example.com/avatar.jpg";
    expect(serializeProfileImageUrl(url)).toBe(url);
  });

  it("returns a signed profile-image route for blob references", () => {
    const result = serializeProfileImageUrl("blob:profile-images/user-1/avatar.jpg");
    expect(result).toContain("/api/v1/me/profile-image?pathname=profile-images%2Fuser-1%2Favatar.jpg");
    expect(result).toContain("signature=");
  });
});
