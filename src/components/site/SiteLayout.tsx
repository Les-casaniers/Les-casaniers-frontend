import { TopBar } from "@/components/site/TopBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ReactNode } from "react";
import { WelcomeMascot } from "./WelcomeMascot";

export const SiteLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <TopBar />
    <Header />
    <WelcomeMascot />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);
