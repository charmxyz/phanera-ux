import { AntAvatar } from "@/components/ants/pixel-ant";

export function EmptyState({ title, description, children, seed = "empty" }: { title: string; description?: string; children?: React.ReactNode; seed?: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <AntAvatar seed={seed} size={56} className="mb-4 opacity-80" />
      <h3 className="font-medium">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-6 w-full max-w-lg">{children}</div>}
    </div>
  );
}
