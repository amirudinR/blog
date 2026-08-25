import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { getAdminDb } from "../src/lib/firebase/admin";

async function probe(name: string, fn: () => Promise<string>) {
  try {
    const result = await fn();
    console.log("OK  ", name, result);
  } catch (error) {
    const err = error as { code?: number; details?: string };
    console.log("FAIL", name, err.code ?? "", err.details ?? "");
  }
}

async function main() {
  const db = getAdminDb();
  await probe("categories limit1", async () => {
    const s = await db.collection("categories").limit(1).get();
    return `docs=${s.size}`;
  });
  await probe("posts limit1", async () => {
    const s = await db.collection("posts").limit(1).get();
    return `docs=${s.size}`;
  });
  await probe("posts where-published limit1", async () => {
    const s = await db
      .collection("posts")
      .where("status", "==", "published")
      .limit(1)
      .get();
    return `docs=${s.size}`;
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
