import { createBrowserRouter } from "react-router";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AccountOverview } from "./pages/AccountOverview";
import { UsersPage } from "./pages/UsersPage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { BillingPage } from "./pages/BillingPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { DataLimitsPage } from "./pages/DataLimitsPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { PlansPage } from "./pages/PlansPage";
import MobileCommentsFeedPage from "./pages/MobileCommentsFeedPage";
import MentionDetailPage from "./pages/MentionDetailPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AdminLayout,
    children: [
      { index: true, Component: AccountOverview },
      { path: "users", Component: UsersPage },
      { path: "integrations", Component: IntegrationsPage },
      { path: "billing", Component: BillingPage },
      { path: "documents", Component: DocumentsPage },
      { path: "limits", Component: DataLimitsPage },
      { path: "audit", Component: AuditLogPage },
      { path: "plans", Component: PlansPage },
    ],
  },
  {
    path: "/mobile-feed",
    Component: MobileCommentsFeedPage,
  },
  {
    path: "/mobile-feed/:mentionId",
    Component: MentionDetailPage,
  },
], { basename });