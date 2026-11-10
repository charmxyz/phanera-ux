"use client";

import { useState, useTransition } from "react";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Persona } from "@/lib/claude/schemas";

export const BLANK_PERSONA: Persona = {
  name: "",
  role: "",
  kind: "human",
  context: "",
  goal: "",
  device: "desktop",
  behaviour: "",
  patience: "medium",
  success_criteria: "",
};

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function PersonaEditor({
  open,
  persona,
  onOpenChange,
  onSave,
  onGenerate,
}: {
  open: boolean;
  persona: Persona | null;
  onOpenChange: (open: boolean) => void;
  onSave: (p: Persona) => void;
  /** Returns an AI-generated persona to prefill the form, or an error message. */
  onGenerate?: () => Promise<{ ok: true; persona: Persona } | { ok: false; error: string }>;
}) {
  const [generating, startGenerate] = useTransition();
  const generate = () =>
    onGenerate &&
    startGenerate(async () => {
      const res = await onGenerate();
      if (res.ok) setDraft(res.persona);
      else toast.error(res.error);
    });
  const [draft, setDraft] = useState<Persona>(persona ?? BLANK_PERSONA);
  const [prevPersona, setPrevPersona] = useState(persona);
  if (persona !== prevPersona) {
    setPrevPersona(persona);
    setDraft(persona ?? BLANK_PERSONA);
  }
  const set = <K extends keyof Persona>(k: K, v: Persona[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const valid = draft.name.trim() && draft.role.trim() && draft.goal.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{persona?.name ? `Edit ${persona.name}` : "Add persona"}</DialogTitle>
          <DialogDescription>Every AI persona attempts the same user task. Describe who they are, why they care and how they browse, or generate one automatically.</DialogDescription>
        </DialogHeader>
        {onGenerate && !persona && (
          <Button type="button" variant="outline" onClick={generate} disabled={generating} className="w-full">
            {generating ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
            {generating ? "Generating persona…" : "Generate persona automatically"}
          </Button>
        )}
        <form
          className={`grid gap-3 transition-opacity ${generating ? "pointer-events-none opacity-50" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onSave({ ...draft, name: draft.name.trim(), role: draft.role.trim(), goal: draft.goal.trim() });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" id="p-name"><Input id="p-name" value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={40} required /></Field>
            <Field label="Role" id="p-role"><Input id="p-role" value={draft.role} onChange={(e) => set("role", e.target.value)} maxLength={60} required /></Field>
          </div>
          <Field label="Motivation" id="p-goal"><Textarea id="p-goal" value={draft.goal} onChange={(e) => set("goal", e.target.value)} maxLength={300} rows={2} required /></Field>
          <Field label="Context" id="p-context"><Textarea id="p-context" value={draft.context} onChange={(e) => set("context", e.target.value)} maxLength={400} rows={2} /></Field>
          <Field label="Behaviour" id="p-behaviour"><Textarea id="p-behaviour" value={draft.behaviour} onChange={(e) => set("behaviour", e.target.value)} maxLength={300} rows={2} /></Field>
          <Field label="Trusts the answer when" id="p-success"><Input id="p-success" value={draft.success_criteria} onChange={(e) => set("success_criteria", e.target.value)} maxLength={200} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Type" id="p-kind">
              <select id="p-kind" className={selectClass} value={draft.kind} onChange={(e) => set("kind", e.target.value as Persona["kind"])}>
                <option value="human">Human</option>
                <option value="ai_agent">AI assistant</option>
              </select>
            </Field>
            <Field label="Device" id="p-device">
              <select id="p-device" className={selectClass} value={draft.device} onChange={(e) => set("device", e.target.value as Persona["device"])}>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </Field>
            <Field label="Patience" id="p-patience">
              <select id="p-patience" className={selectClass} value={draft.patience} onChange={(e) => set("patience", e.target.value as Persona["patience"])}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!valid || generating}>Save persona</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
