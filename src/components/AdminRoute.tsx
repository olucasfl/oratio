import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProfile } from "../services/profileService";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {

    let active = true;

    getProfile()
      .then((profile) => {
        if (active) setStatus(profile?.isAdmin ? "allowed" : "denied");
      })
      .catch(() => {
        if (active) setStatus("denied");
      });

    return () => {
      active = false;
    };

  }, []);

  if (status === "loading") {
    return null;
  }

  if (status === "denied") {
    return <Navigate to="/oratio/home" replace />;
  }

  return children;

}
