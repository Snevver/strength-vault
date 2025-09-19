import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <aside className="lg:sticky lg:top-4 lg:h-fit">
            <Navigation />
          </aside>
          <main className="min-h-[calc(100vh-2rem)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};