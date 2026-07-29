import { del, list } from "@vercel/blob";

/**
 * Delete all Vercel Blob objects stored under a preview's blob namespace
 * (`onboarding/{onboardingToken}/…`).
 */
export async function deletePreviewBlobPrefix(onboardingToken: string): Promise<{
  deleted: number;
  errors: number;
}> {
  const token = onboardingToken?.trim();
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token || !blobToken) {
    return { deleted: 0, errors: 0 };
  }

  const prefix = `onboarding/${token}/`;
  let cursor: string | undefined;
  let deleted = 0;
  let errors = 0;

  do {
    const page = await list({
      token: blobToken,
      prefix,
      cursor,
      limit: 200,
    });

    if (page.blobs.length > 0) {
      const urls = page.blobs.map((b) => b.url);
      try {
        await del(urls, { token: blobToken });
        deleted += urls.length;
      } catch (error) {
        console.warn("[preview] batch blob delete failed, trying one-by-one", error);
        for (const url of urls) {
          try {
            await del(url, { token: blobToken });
            deleted += 1;
          } catch (oneError) {
            errors += 1;
            console.warn("[preview] blob delete failed", url, oneError);
          }
        }
      }
    }

    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return { deleted, errors };
}
