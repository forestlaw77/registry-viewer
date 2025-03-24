import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTags, fetchTags } from "@/lib/registryAPI";
import {
  ActionBar,
  Table,
  Spinner,
  Separator,
  Checkbox,
  Portal,
  Button,
  Kbd,
  Alert,
} from "@chakra-ui/react";
import ErrorPanel from "../common/ErrorPanel";

const LOCAL_REGISTRY_URL = process.env.NEXT_PUBLIC_REGISTRY_URL  || "http://localhost:5000";
const sanitizedRegistryURL = LOCAL_REGISTRY_URL.replace(/^https?:\/\//, "");

/**
 * Props for the ListTags component.
 */
type TagsProps = {
  /**
   * The repository name for which tags are being displayed.
   */
  repository: string;

  /**
   * Callback function to handle the click event on a tag.
   * @param tag - The selected tag name.
   */
  onTagClick: (tag: string) => void;
};

/**
 * ListTags is a component that displays a list of tags for a given repository.
 * It provides functionality to select multiple tags, view their details, and perform actions such as deleting selected tags.
 *
 * @param props - The props for the ListTags component.
 * @returns The rendered component.
 */
function ListTags({ repository, onTagClick }: TagsProps) {
  /**
   * Fetches the tags for the specified repository using react-query.
   */
  const {
    data: tags = [], // Default to an empty array if no tags are returned.
    isLoading, // Loading state during the API request.
    isError, // Error state if the API request fails.
    refetch, // Function to manually retry the API request.
  } = useQuery({
    queryKey: ["tags", repository],
    queryFn: () => fetchTags(repository),
  });

  /**
   * State to manage selected tags.
   */
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const queryClient = useQueryClient();

  /**
   * Indicates if any tags are selected.
   */
  const hasSelectedTags = selectedTags.length > 0;

  /**
   * Indicates if the "Select All" checkbox should be indeterminate.
   */
  const indeterminate = hasSelectedTags && selectedTags.length < tags.length;

  /**
   * Toggles the selection of a specific tag.
   *
   * @param tag - The tag to toggle selection for.
   */
  const handleSelectTag = (tag: string) => {
    setSelectedTags((prevSelected) =>
      prevSelected.includes(tag)
        ? prevSelected.filter((t) => t !== tag)
        : [...prevSelected, tag]
    );
  };

  const handleDeleteTags = async () => {
    try {
      // Perform the delete operation for the selected tags.
      await deleteTags(repository, selectedTags);
      queryClient.invalidateQueries({ queryKey: ["tags", repository] }); // Invalidate the tags query to refetch the updated list.
      setSelectedTags([]); // Clear selected tags after deletion.
    } catch (error) {
      console.error("Error deleting tags:", error);
    }
  };

  if (isLoading) {
    // Render a spinner while tags are being loaded.
    return (
      <>
        <Separator />
        <Spinner size="lg" />
        <p>Loading tags for repository: {repository}...</p>
      </>
    );
  }

  if (isError) {
    // Render an error panel if there is an issue fetching tags.
    return (
      <>
        <Separator />
        <ErrorPanel
          errorMessage={
            "Error fetching tags. Please try again. If the issue persists, contact support."
          }
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <>
      <Separator />
      {!tags || tags.length === 0 ? (
        <p>No tags found for repository: {repository}</p>
      ) : (
        <>
          {/* Warning card */}
          {hasSelectedTags && (
            <Alert.Root status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  Deleting a tag cannot be undone. Be sure to check the contents
                  before deleting. All tags with the same digest as the tag you
                  are deleting will be deleted. An image will only run if all
                  tags associated with it are deleted.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          {/* Table for displaying tags */}
          <Table.Root
            size="sm"
            variant="outline"
            colorScheme="teal"
            style={{ overflowX: "auto" }}
          >
            <Table.Header>
              <Table.Row>
                {/* Column for selecting tags */}
                <Table.ColumnHeader w="6">
                  <Checkbox.Root
                    size="sm"
                    top="0.5"
                    aria-label="Select all rows"
                    checked={
                      indeterminate ? "indeterminate" : selectedTags.length > 0
                    }
                    onCheckedChange={(changes) => {
                      setSelectedTags(
                        changes.checked ? tags.map((tag) => tag) : []
                      );
                    }}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.ColumnHeader>
                <Table.ColumnHeader>Tag Name</Table.ColumnHeader>
                <Table.ColumnHeader>Pull</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
                {tags.map((tag) => (
                <Table.Row key={tag}>
                  <Table.Cell w="6">
                    {/* Checkbox for individual tag selection */}
                    <Checkbox.Root
                      size="sm"
                      top="0.5"
                      aria-label={`Select tag ${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleSelectTag(tag)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Table.Cell>
                  {/* Displays the tag name */}
                  <Table.Cell
                    onClick={() => onTagClick(tag)}
                    cursor="pointer"
                    title={`View details for ${tag}`}
                    _hover={{ bg: "gray.100" }}
                  >
                    {tag}
                  </Table.Cell>
                    {/* Displays the docker pull command */}
                  <Table.Cell
                    onClick={() => {
                      const pullCommand = `docker pull ${sanitizedRegistryURL}/${repository}:${tag}`;
                      navigator.clipboard.writeText(pullCommand); // Copies the text to the clipboard
                      console.log(`Copied to clipboard: ${pullCommand}`);
                    }}
                    cursor="pointer"
                    title="Click to copy pull command"
                    _hover={{ bg: "gray.100" }}
                  >
                      docker pull {sanitizedRegistryURL}/{repository}:{tag}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </>
      )}

      {/* ActionBar for managing selected tags */}
      <ActionBar.Root open={hasSelectedTags}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.SelectionTrigger>
                {selectedTags.length} selected:{" "}
                {selectedTags.slice(0, 3).join(", ")}
                {selectedTags.length > 3 &&
                  `, +${selectedTags.length - 3} more`}
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              {/* Button for deleting selected tags */}
              <Button variant="outline" size="sm" onClick={handleDeleteTags}>
                Delete <Kbd>⌫</Kbd>
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </>
  );
}

export default ListTags;
