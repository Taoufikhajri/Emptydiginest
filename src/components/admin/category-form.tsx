"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveCategory } from "@/app/actions/admin";
import { iconNames } from "@/lib/icons";
import { buttonClass, inputClass, secondaryButtonClass } from "./ui";

type CategoryValues = { id?: number; name: string; slug: string; icon: string; sortOrder: number };

export function CategoryForm({ values }: { values: CategoryValues }) {
  const [state, action, pending] = useActionState(saveCategory, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const isNew = !values.id;

  // Clear the "new category" form after a successful save.
  useEffect(() => {
    if (state?.saved && isNew) formRef.current?.reset();
  }, [state, isNew]);

  return (
    <form ref={formRef} action={action} className="grid items-end gap-3 sm:grid-cols-[1.4fr_1fr_1fr_90px_auto]">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <label className="block text-xs font-medium">
        Name
        <input name="name" required defaultValue={values.name} maxLength={80} className={inputClass} />
      </label>
      <label className="block text-xs font-medium">
        Slug
        <input name="slug" defaultValue={values.slug} placeholder="auto" maxLength={80} className={inputClass} />
      </label>
      <label className="block text-xs font-medium">
        Icon
        <select name="icon" defaultValue={values.icon} className={inputClass}>
          {iconNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium">
        Order
        <input name="sortOrder" type="number" min={0} defaultValue={values.sortOrder} className={inputClass} />
      </label>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className={isNew ? buttonClass : secondaryButtonClass}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : state?.saved ? <Check className="size-4" /> : null}
          {isNew ? "Add" : "Save"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-destructive sm:col-span-5">{state.error}</p>}
    </form>
  );
}
