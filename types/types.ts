/**
 * Represents the details of a manifest, including its digest, size, media type, and optional platform information.
 */
export interface ManifestDetails {
  /**
   * The digest of the manifest.
   */
  digest: string;

  /**
   * The size of the manifest.
   */
  size: number;

  /**
   * The media type of the manifest.
   */
  mediaType: string;

  /**
   * Optional platform information, including architecture and OS.
   */
  platform?: {
    /**
     * The architecture of the platform.
     */
    architecture: string;

    /**
     * The operating system of the platform.
     */
    os: string;
  };
}

/**
 * Represents the details of a Blob object, including its digest and media type.
 */
export interface BlobDetails {
  /**
   * The digest of the blob.
   */
  digest: string;

  /**
   * The size of the blob.
   */
  size: number;

  /**
   * The media type of the blob.
   */
  mediaType: string;
}

/**
 * Defines the state structure for the Docker repository viewer.
 */
export type ViewerState = {
  /**
   * Selected repository name. Null if no repository is selected.
   */
  selectedRepo: string | null;

  /**
   * Selected tag associated with the repository. Null if no tag is selected.
   */
  selectedTag: string | null;

  /**
   * Selected manifest details. Null if no manifest is selected.
   */
  selectedManifest: ManifestDetails | null;

  /**
   * Selected blob details. Null if no blob is selected.
   */
  selectedBlob: BlobDetails | null;
};
