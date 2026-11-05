import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return (
    <div className="container-reading py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-4 text-muted-foreground">
        This page is a placeholder for the MVP. Replace it with your reviewed privacy policy before launch.
      </p>
    </div>
  );
}
