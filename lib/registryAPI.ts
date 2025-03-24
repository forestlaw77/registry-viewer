import apiClient from "@/lib/apiClient";

/**
 * Fetches the list of repositories from the API.
 *
 * @returns A promise that resolves to an array of repository names. If the request fails, returns an empty array.
 */
export const fetchRepositories = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get("/proxy/_catalog");
    return response.data.repositories;
  } catch (error) {
    console.error("Failed to fetch repositories", error);
    return [];
  }
};

/**
 * Fetches the list of tags for a given repository.
 *
 * @param repository - The name of the repository for which to fetch tags.
 * @returns A promise that resolves to an array of tag names. If the request fails, returns an empty array.
 */
export const fetchTags = async (repository: string): Promise<string[]> => {
  try {
    const response = await apiClient.get(`/proxy/${repository}/tags/list`);
    return response.data.tags;
  } catch (error) {
    console.error(`Failed to fetch tags for ${repository}`, error);
    return [];
  }
};

/**
 * Fetches the manifest for a specific repository and reference (tag or digest).
 *
 * @param repository - The name of the repository.
 * @param reference - The reference to the manifest (can be a tag or a digest).
 * @param mediaType - Optional media type to specify the request format (only required when reference is a digest).
 * @returns A promise that resolves to the manifest data, including digest and response data.
 *          If the request fails or no manifest is found, returns null.
 */
export const fetchManifests = async (
  repository: string,
  reference: string,
  mediaType?: string | null
): Promise<any> => {
  if (mediaType) {
    // If a media type is specified, the reference is treated as a digest.
    try {
      const response = await apiClient.get(
        `proxy/${repository}/manifests/${reference}`,
        {
          headers: {
            Accept: mediaType,
          },
        }
      );
      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch manifest for ${repository}:${reference} - status: ${response.status}`
        );
      }
      const digest = response.headers["docker-content-digest"];
      return {
        digest,
        data: response.data,
      };
    } catch (error) {
      console.log(
        `Failed to fetch manifest for ${repository}:${reference} - mediaType = ${mediaType}- error:${error}`
      );
      return null;
    }
  } else {
    // If no media type is specified, attempt to fetch using multiple media types.
    const mediaTypes = [
      "application/vnd.docker.distribution.manifest.v2+json",
      "application/vnd.oci.image.index.v1+json",
    ];
    for (const mediaType of mediaTypes) {
      try {
        const response = await apiClient.get(
          `proxy/${repository}/manifests/${reference}`,
          {
            // Validate status for 404 Not Found to handle missing manifests.
            validateStatus: (status): boolean =>
              status === 200 || status === 404,
            headers: {
              Accept: mediaType,
            },
          }
        );

        if (response.status === 200) {
          const digest = response.headers["docker-content-digest"];
          return {
            digest,
            data: response.data,
          };
        }
      } catch (error) {
        console.error(
          `Failed to fetch manifest for ${repository}:${reference} - mediaType = ${mediaType}- error:${error}`
        );
      }
    }
  }
  return null;
};

/**
 * Fetches the blob for a given repository and digest.
 *
 * @param repository - The name of the repository.
 * @param digest - The digest of the blob to fetch.
 * @param mediaType - The media type to specify in the request headers.
 * @returns A promise that resolves to the blob data. If the request fails, returns an empty object.
 */
export const fetchBlob = async (
  repository: string,
  digest: string,
  mediaType: string
): Promise<any> => {
  const decodeMediaType = decodeURIComponent(mediaType);
  try {
    const response = await apiClient.get(
      `/proxy/${repository}/blobs/${digest}`,
      {
        headers: {
          Accept: decodeMediaType,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch blob for ${repository}:${digest} with mediaType ${decodeMediaType}`,
      error
    );
    return {};
  }
};

/**
 * Deletes a tag for a specific repository.
 * This involves fetching the manifest for the tag to retrieve its digest,
 * followed by a DELETE request to remove the manifest.
 *
 * @param repository - The name of the repository containing the tag.
 * @param tag - The tag to delete.
 * @returns A promise that resolves when the tag is successfully deleted.
 *          Logs an error to the console if the operation fails.
 */
export const deleteTag = async (
  repository: string,
  tag: string
): Promise<void> => {
  try {
    // Fetch the manifest for the tag to get the digest.
    const manifests = await fetchManifests(repository, tag);

    if (!manifests || !manifests.digest) {
      throw new Error(
        `Unable to find digest for tag "${tag}" in repository "${repository}".`
      );
    }

    // Send the DELETE request to remove the manifest by its digest.
    await apiClient.delete(
      `/proxy/${repository}/manifests/${manifests.digest}`
    );

    console.log(
      `Successfully deleted tag "${tag}" from repository "${repository}".`
    );
  } catch (error) {
    console.error(
      `Failed to delete tag "${tag}" for repository "${repository}".`,
      error
    );
  }
};

/**
 * Deletes multiple tags for a specific repository.
 * This function iterates over the provided tags and deletes each one by calling the deleteTag function.
 *
 * @param repository - The name of the repository containing the tags.
 * @param tags - An array of tags to delete.
 * @returns A promise that resolves when all tags are successfully deleted.
 *          Logs an error to the console if the operation fails for any tag.
 */
export const deleteTags = async (
  repository: string,
  tags: string[]
): Promise<void> => {
  for (const tag of tags) {
    await deleteTag(repository, tag);
  }
};
