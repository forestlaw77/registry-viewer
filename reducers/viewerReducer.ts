// Code for the Docker repository viewer state management.
//
// This file defines the state structure and reducer function for the Docker repository viewer.
// The state includes the selected repository, tag, manifest, blob, and media type.
// The reducer function handles actions to update the state based on user interactions.
//

import { ManifestDetails, BlobDetails, ViewerState } from "@/types/types";
import initialState from "./initialState";

/**
 * Defines the possible actions that can modify the ViewerState.
 */
export type ViewerAction =
  | { type: "SELECT_REPOSITORY"; payload: string }
  | { type: "SELECT_TAG"; payload: string }
  | { type: "SELECT_MANIFEST"; payload: ManifestDetails }
  | { type: "SELECT_BLOB"; payload: BlobDetails }
  | { type: "RESET_REPOSITORY" }
  | { type: "RESET_TAG" }
  | { type: "RESET_MANIFEST" }
  | { type: "RESET_BLOB" };

/**
 * Reducer function to manage the state transitions for the DockerRepositoryViewer component.
 *
 * @param state - Current state of the viewer.
 * @param action - Action to update the state.
 * @returns Updated state based on the action type.
 */
const viewerReducer = (
  state: ViewerState,
  action: ViewerAction
): ViewerState => {
  switch (action.type) {
    case "SELECT_REPOSITORY":
      return {
        ...state,
        selectedRepo: action.payload,
        selectedTag: null,
        selectedManifest: null,
        selectedBlob: null,
      };
    case "SELECT_TAG":
      return {
        ...state,
        selectedTag: action.payload,
        selectedManifest: null,
        selectedBlob: null,
      };
    case "SELECT_MANIFEST":
      return {
        ...state,
        selectedManifest: action.payload,
        selectedBlob: null,
      };
    case "SELECT_BLOB":
      return {
        ...state,
        selectedBlob: action.payload,
      };
    case "RESET_REPOSITORY":
      return initialState;
    case "RESET_TAG":
      return {
        ...state,
        selectedTag: null,
        selectedManifest: null,
        selectedBlob: null,
      };
    case "RESET_MANIFEST":
      return {
        ...state,
        selectedManifest: null,
        selectedBlob: null,
      };
    case "RESET_BLOB":
      return {
        ...state,
        selectedBlob: null,
      };
    default:
      return state;
  }
};

export default viewerReducer;
