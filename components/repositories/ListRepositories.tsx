import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRepositories } from "@/lib/registryAPI";
import { Table, Spinner, Separator } from "@chakra-ui/react";
import ErrorPanel from "../common/ErrorPanel";

/**
 * Props for the ListRepositories component.
 */
type ListRepositoriesProps = {
  /**
   * Callback function to handle the click event on a repository row.
   * @param repository - The name of the selected repository.
   */
  onRepositoryClick: (repository: string) => void;
};

/**
 * ListRepositories is a component that displays a list of repositories fetched from the registry API.
 * It provides loading, error, and data display states, along with a callback for repository selection.
 *
 * @param props - The props for the ListRepositories component.
 * @returns The rendered component.
 */
function ListRepositories({ onRepositoryClick }: ListRepositoriesProps) {
  // Fetches the list of repositories using react-query.
  const {
    data: repositories = [], // Default to an empty array if data is undefined.
    isLoading, // Indicates if the data is currently being fetched.
    isError, // Indicates if there was an error in fetching the data.
    refetch, // Function to refetch the data manually.
  } = useQuery({
    queryKey: ["repositories"],
    queryFn: fetchRepositories,
  });

  if (isLoading) {
    // Renders a spinner and a loading message while the data is being fetched.
    return (
      <>
        <Separator />
        <Spinner size="lg" />
        <p>Loading repositories...</p>
      </>
    );
  }

  if (isError) {
    // Renders an error panel with a retry button if there is an error in fetching the data.
    return (
      <>
        <Separator />
        <ErrorPanel
          errorMessage={
            "Error fetching repositories. Please try again. If the issue persists, contact support."
          }
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <>
      <Separator />
      {/* Displays a table of repositories */}
      <Table.Root
        size="sm"
        variant="outline"
        colorScheme="teal"
        style={{ overflowX: "auto" }} // Enables horizontal scrolling for wide content.
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Repository Name</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {/* Maps over the list of repositories and creates a row for each */}
          {repositories.map((repo) => (
            <Table.Row
              key={repo} // Sets a unique key for each row.
              onClick={() => onRepositoryClick(repo)} // Calls the onRepositoryClick callback with the selected repository name.
              cursor="pointer"
              title={`View details for ${repo}`} // Sets a tooltip with the repository name.
              _hover={{ bg: "gray.100" }} // Changes background color on hover.
            >
              <Table.Cell>{repo}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}

export default ListRepositories;
