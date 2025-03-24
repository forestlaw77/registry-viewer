// Initial state for the Docker repository viewer.
import { ViewerState } from "@/types/types";

/**
 * Initial state for the Docker repository viewer.
 */
const initialState: ViewerState = {
  selectedRepo: null,
  selectedTag: null,
  selectedManifest: null,
  selectedBlob: null,
};

export default initialState;
