import React, { useState } from "react";
import { ManifestDetails, BlobDetails } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { fetchManifests } from "@/lib/registryAPI";
import { Table, Spinner, Button, Separator } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import ErrorPanel from "../common/ErrorPanel";

const ReactJsonView = dynamic(() => import("react-json-view"), {
  ssr: false,
});

/**
 * Props for the ListManifests component.
 */
type DisplayManifestsProps = {
  /**
   * The name of the repository containing the manifests.
   */
  repository: string;

  /**
   * The digest associated with the repository for which manifests are displayed.
   */
  digest: string;

  /**
   * The media type of the manifest being queried. Can be null.
   */
  mediaType: string;

  /**
   * Callback function triggered when a blob is clicked.
   * @param blob - Details of the clicked blob.
   */
  onBlobClick: (blob: BlobDetails) => void;
};

/**
 * ListManifests is a component that displays manifests, configurations, and layers
 * for a specific repository and tag. It allows users to toggle between a JSON view
 * and a tabular view, and provides functionality to select blobs or manifests.
 *
 * @param props - The props for the ListManifests component.
 * @returns The rendered component.
 */
const DisplayManifests = ({
  repository,
  digest,
  mediaType,
  onBlobClick,
}: DisplayManifestsProps) => {
  /**
   * Fetches the manifests for the specified repository and tag using react-query.
   */
  const {
    data: manifestResponse, // The response containing the manifests, configs, and layers.
    isLoading, // Indicates if the query is loading.
    isError, // Indicates if there was an error during the query.
    refetch, // Function to manually refetch the data.
  } = useQuery({
    queryKey: ["manifests", repository, digest, mediaType],
    queryFn: () => fetchManifests(repository, digest, mediaType),
  });

  /**
   * State to manage whether the JSON view is displayed.
   */
  const [showJsonView, setShowJsonView] = useState(false);

  if (isLoading) {
    // Renders a spinner and loading message while fetching manifests.
    return (
      <>
        <Separator />
        <Spinner size="lg" />
        <p>Loading Manifests...</p>
      </>
    );
  }

  if (isError) {
    // Renders an error panel if the manifest fetch request fails.
    return (
      <>
        <Separator />
        <ErrorPanel
          errorMessage={
            "Error fetching manifests. Please try again. If the issue persists, contact support."
          }
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <div>
      <h2>Manifests for digest {digest} DisplayManifests</h2>

      {/* Button to toggle JSON view */}
      {manifestResponse && manifestResponse.data && (
        <Button
          onClick={() => setShowJsonView((prev) => !prev)}
          colorScheme="teal"
          mb={4}
        >
          {showJsonView ? "Hide JSON View" : "Show JSON View"}
        </Button>
      )}

      {/* JSON view for manifest data */}
      {showJsonView && (
        <ReactJsonView
          src={manifestResponse.data}
          theme="monokai"
          collapsed={2} // Collapses the JSON view by default.
        />
      )}

      {/* Displays Config and Layers table if config data exists */}
      {manifestResponse?.data?.config ? (
        <div>
          <h2>Config and Layers</h2>
          <Table.Root
            size="sm"
            variant="outline"
            colorScheme="teal"
            style={{ overflowX: "auto" }}
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Media Type</Table.ColumnHeader>
                <Table.ColumnHeader>Digest</Table.ColumnHeader>
                <Table.ColumnHeader>Size</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {/* Config row */}
              <Table.Row
                style={{ backgroundColor: "#f1f1f1" }}
                onClick={() => onBlobClick(manifestResponse.data.config)}
                cursor={"pointer"}
                title={`View details for ${manifestResponse.data.config.digest}`}
                _hover={{ backgroundColor: "gray.200" }}
              >
                <Table.Cell>Config</Table.Cell>
                <Table.Cell>
                  {manifestResponse.data.config.mediaType}
                </Table.Cell>
                <Table.Cell>{manifestResponse.data.config.digest}</Table.Cell>
                <Table.Cell>{manifestResponse.data.config.size}</Table.Cell>
              </Table.Row>

              {/* Layers rows */}
              {manifestResponse.data.layers &&
                manifestResponse.data.layers.map((layer: BlobDetails) => (
                  <Table.Row key={layer.digest}>
                    <Table.Cell>Layer</Table.Cell>
                    <Table.Cell>{layer.mediaType}</Table.Cell>
                    <Table.Cell>{layer.digest}</Table.Cell>
                    <Table.Cell>{layer.size}</Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table.Root>
        </div>
      ) : (
        <p>No manifests or config data found</p>
      )}
    </div>
  );
};

export default DisplayManifests;
