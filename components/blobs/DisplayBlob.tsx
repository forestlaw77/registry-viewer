import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBlob } from "@/lib/registryAPI";
import { Table, Spinner, Button, Separator } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import ErrorPanel from "../common/ErrorPanel";

const ReactJsonView = dynamic(() => import("react-json-view"), {
  ssr: false,
});

/**
 * Props for the DisplayBlob component.
 */
type DisplayBlobProps = {
  /**
   * The name of the repository containing the blob.
   */
  repository: string;

  /**
   * The digest value identifying the blob to fetch.
   */
  daigest: string;

  /**
   * The media type associated with the blob to fetch.
   */
  mediaType: string;
};

/**
 * DisplayBlob is a component that fetches and displays blob data for a given repository,
 * digest, and media type. It allows toggling between a JSON view and a tabular view for
 * better visualization of the blob's key-value structure.
 *
 * @param props - Props passed to the DisplayBlob component.
 * @returns The rendered component.
 */
function DisplayBlob({ repository, daigest, mediaType }: DisplayBlobProps) {
  /**
   * Fetches the blob data using react-query for the specified repository, digest, and media type.
   */
  const {
    data: blobResponse, // The response containing the blob data.
    isLoading, // Indicates if the query is loading.
    isError, // Indicates if there was an error during the query.
    refetch, // Function to manually refetch the data.
  } = useQuery({
    queryKey: ["blob", repository, daigest, mediaType],
    queryFn: () => fetchBlob(repository, daigest, mediaType),
  });

  /**
   * State to manage whether the JSON view is displayed.
   */
  const [showJsonView, setShowJsonView] = useState(false);

  if (isLoading) {
    // Render a spinner and loading message while fetching blob data.
    return (
      <>
        <Separator />
        <Spinner size="lg" />
        <p>Loading Blob...</p>
      </>
    );
  }

  if (isError) {
    // Render an error panel if the blob fetch request fails.
    return (
      <>
        <Separator />
        <ErrorPanel
          errorMessage={
            "Error fetching config. Please try again. If the issue persists, contact support."
          }
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <>
      <Separator />
      <h2>Blob for digest : DisplayBlob</h2>
      {/* Button to toggle between JSON and table view */}
      {blobResponse && (
        <Button
          onClick={() => setShowJsonView((prev) => !prev)}
          colorScheme="teal"
          mb={4}
        >
          {showJsonView ? "Hide JSON View" : "Show JSON View"}
        </Button>
      )}

      {/* JSON view for blob data */}
      {showJsonView && (
        <ReactJsonView
          src={blobResponse}
          theme="monokai"
          collapsed={2} // Collapses the JSON view by default.
        />
      )}

      {/* Table view for blob data */}
      {!showJsonView && blobResponse && (
        <Table.Root
          size="sm"
          variant="outline"
          colorScheme="teal"
          style={{
            marginLeft: "0", // Align table to the left.
            marginRight: "auto", // Remove extra margin on the right.
            overflowX: "auto", // Enable horizontal scrolling.
            width: "fit-content", // Adjust table width based on content.
          }}
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Value</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Object.entries(blobResponse).map(([key, value]) => (
              <Table.Row key={key}>
                <Table.ColumnHeader>{key}</Table.ColumnHeader>
                <Table.Cell>
                  {typeof value === "object" ? (
                    <ReactJsonView
                      // @ts-ignore
                      src={value}
                      name={null}
                      collapsed={2}
                      theme="monokai"
                    />
                  ) : (
                    value?.toString()
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </>
  );
}

export default DisplayBlob;
