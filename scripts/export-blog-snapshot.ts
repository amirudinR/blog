import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "node:fs";
import path from "node:path";

import { getAdminDb } from "../src/lib/firebase/admin";

type SnapshotTaxonomy = { id: string; nameId: string; nameEn: string };

async function main() {
  const db = getAdminDb();
  const [postsSnap, catSnap, tagSnap] = await Promise.all([
    db.collection("posts").get(),
    db.collection("categories").get(),
    db.collection("tags").get(),
  ]);

  const snapshot = {
    exportedAt: new Date().toISOString(),
    posts: postsSnap.docs.map((d) => ({ id: d.id, data: d.data() })),
    categories: catSnap.docs.map<SnapshotTaxonomy>((d) => ({
      id: d.id,
      nameId: (d.get("nameId") as string | undefined) ?? "",
      nameEn: (d.get("nameEn") as string | undefined) ?? "",
    })),
    tags: tagSnap.docs.map<SnapshotTaxonomy>((d) => ({
      id: d.id,
      nameId: (d.get("nameId") as string | undefined) ?? "",
      nameEn: (d.get("nameEn") as string | undefined) ?? "",
    })),
  };

  const out = path.join(
    process.cwd(),
    "src",
    "lib",
    "db",
    "blog-data-snapshot.json"
  );
  fs.writeFileSync(out, JSON.stringify(snapshot));
  console.log(
    `Snapshot written: ${out} (${snapshot.posts.length} posts, ${snapshot.categories.length} categories, ${snapshot.tags.length} tags)`
  );
}

main().catch((error) => {
  console.error("Failed to export snapshot:", error);
  process.exit(1);
});
