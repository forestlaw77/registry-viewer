import React from "react";
import { Button, Box } from "@chakra-ui/react";

/**
 * Props for the ErrorPanel component.
 */
type ErrorPanelProps = {
  /**
   * The error message to display in the error panel.
   * Defaults to "An unexpected error occurred." if not provided.
   */
  errorMessage?: string;

  /**
   * Callback function to handle the retry action.
   */
  onRetry: () => void;
};

/**
 * ErrorPanel is a reusable component that displays an error message along with
 * a retry button. It is styled using Chakra UI to provide a visually distinct error panel.
 *
 * @param props - Props for the ErrorPanel component.
 * @returns A styled error message with a retry button.
 */
const ErrorPanel: React.FC<ErrorPanelProps> = ({
  errorMessage = "An unexpected error occurred.",
  onRetry,
}) => {
  return (
    <Box
      border="1px"
      borderColor="red.400"
      bg="red.50"
      p={4}
      borderRadius="md"
      textAlign="center"
    >
      <p>{errorMessage}</p>
      <Button colorScheme="red" onClick={onRetry} mt={4}>
        Retry
      </Button>
    </Box>
  );
};

export default ErrorPanel;
