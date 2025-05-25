import { FC, ReactNode, useMemo } from "react";
import {
  RouterProvider as ReactRouterProvider,
  createBrowserRouter,
  RouteObject,
} from "react-router-dom";
import { MainLayout } from "../../components/layout/MainLayout";
import { DashboardPage } from "../../pages/dashboard/DashboardPage";
import { SettingsPage } from "../../pages/settings/SettingsPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <DashboardPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
];

type RouterProviderProps = {
  children?: ReactNode;
};

export const RouterProvider: FC<RouterProviderProps> = () => {
  const router = useMemo(() => createBrowserRouter(routes), []);

  return <ReactRouterProvider router={router} />;
};
