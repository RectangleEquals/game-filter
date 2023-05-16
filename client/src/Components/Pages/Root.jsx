import { Outlet } from "react-router-dom";

export default function Root() {
    return (
      <>
        <div className="d-flex flex-column min-vh-100 min-vw-100 border-bottom border-primary">
          <Outlet />
        </div>
      </>
    )
}
