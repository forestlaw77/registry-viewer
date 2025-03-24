"use client";

import { useReducer } from "react";
import { Breadcrumb, Heading, Separator } from "@chakra-ui/react";
import { BlobDetails, ManifestDetails } from "@/types/types";
import viewerReducer from "@/reducers/viewerReducer";
import initialState from "@/reducers/initialState";
import ListRepositories from "@/components/repositories/ListRepositories";
import ListTags from "@/components/tags/ListTags";
import ListManifests from "@/components/manifests/ListManifests";
import DisplayBlob from "@/components/blobs/DisplayBlob";
import DisplayManifest from "@/components/manifests/DisplayManifest";

/**
 * Main component for the Docker repository viewer.
 * Manages the selection and display of repositories, tags, manifests, and blobs.
 *
 * @returns React component representing the viewer.
 */
const DockerRepositoryViewer = () => {
  const [state, dispatch] = useReducer(viewerReducer, initialState);

  /**
   * Handles the selection of a repository.
   *
   * @param repository - The name of the selected repository.
   */
  const handleRepositoryClick = (repository: string) => {
    dispatch({ type: "SELECT_REPOSITORY", payload: repository });
  };

  /**
   * Handles the selection of a tag.
   *
   * @param tag - The name of the selected tag.
   */
  const handleTagClick = (tag: string) => {
    dispatch({ type: "SELECT_TAG", payload: tag });
  };

  /**
   * Handles the selection of a manifest.
   *
   * @param manifest - The selected manifest details.
   */
  const handleManifestClick = (manifest: ManifestDetails) => {
    dispatch({ type: "SELECT_MANIFEST", payload: manifest });
  };

  /**
   * Handles the selection of a blob.
   *
   * @param blob - The selected blob details.
   */
  const handleBlobClick = (blob: BlobDetails) => {
    dispatch({ type: "SELECT_BLOB", payload: blob });
  };

  return (
    <div>
      <Heading>Docker Repository Viewer</Heading>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item
            onClick={() => dispatch({ type: "RESET_REPOSITORY" })}
          >
            Repositories
          </Breadcrumb.Item>
          {state.selectedRepo && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item onClick={() => dispatch({ type: "RESET_TAG" })}>
                {state.selectedRepo}
              </Breadcrumb.Item>
            </>
          )}
          {state.selectedTag && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item
                onClick={() => dispatch({ type: "RESET_MANIFEST" })}
              >
                {state.selectedTag}
              </Breadcrumb.Item>
            </>
          )}
          {state.selectedManifest && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item onClick={() => dispatch({ type: "RESET_BLOB" })}>
                Manifest
              </Breadcrumb.Item>
            </>
          )}
          {state.selectedBlob && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>Blob</Breadcrumb.Item>
            </>
          )}
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <Separator />
      <br />
      {!state.selectedRepo ? (
        <ListRepositories onRepositoryClick={handleRepositoryClick} />
      ) : !state.selectedTag ? (
        <ListTags repository={state.selectedRepo} onTagClick={handleTagClick} />
      ) : !state.selectedManifest && !state.selectedBlob ? (
        <ListManifests
          repository={state.selectedRepo}
          tag={state.selectedTag}
          onBlobClick={handleBlobClick}
          onManifestClick={handleManifestClick}
        />
      ) : state.selectedBlob ? (
        <DisplayBlob
          repository={state.selectedRepo}
          daigest={state.selectedBlob.digest}
          mediaType={state.selectedBlob.mediaType}
        />
      ) : (
        state.selectedManifest && (
          <DisplayManifest
            repository={state.selectedRepo}
            digest={state.selectedManifest.digest}
            mediaType={state.selectedManifest.mediaType}
            onBlobClick={handleBlobClick}
          />
        )
      )}
    </div>
  );
};

export default DockerRepositoryViewer;
