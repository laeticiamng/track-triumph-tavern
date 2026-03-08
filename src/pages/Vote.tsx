import { Navigate } from "react-router-dom";

/**
 * Vote page now redirects to the unified Explore page in vote mode.
 */
const Vote = () => {
  return <Navigate to="/explore?mode=vote" replace />;
};

export default Vote;
