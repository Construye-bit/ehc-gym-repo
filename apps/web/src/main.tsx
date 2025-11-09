import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { PageLoader } from "./components/shared/page-loader";
import { routeTree } from "./routeTree.gen";

import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPendingComponent: () => <PageLoader variant="minimal" message="Navegando..." />,
    defaultPendingMinMs: 800,
    defaultPendingMs: 2000,
    context: {},
    Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
        return (
                <ClerkProvider
                    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
                >
                    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                        {children}
                    </ConvexProviderWithClerk>
                </ClerkProvider>
        );
    },
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<RouterProvider router={router} />);
}