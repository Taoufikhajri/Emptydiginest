"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateOrder } from "@/app/actions/admin";
import { orderStatuses, type OrderStatus } from "@/lib/order-status";
import { buttonClass, inputClass } from "./ui";

export function OrderUpdateForm({ id, status, deliveryNote }: { id: number; status: OrderStatus; deliveryNote: string }) {
  const [state, action, pending] = useActionState(updateOrder, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="block text-sm font-medium">
        Status
        <select name="status" defaultValue={status} className={inputClass}>
          {orderStatuses.map((value) => (
            <option key={value} value={value} className="capitalize">
              {value[0].toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Delivery details
        <textarea
          name="deliveryNote"
          defaultValue={deliveryNote}
          rows={6}
          placeholder="License keys, download links or activation steps. The customer sees this once the status is Delivered."
          className={`${inputClass} h-auto py-2 font-mono`}
        />
      </label>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </button>
        {state?.saved && !pending && (
          <span className="inline-flex items-center gap-1 text-sm text-signal-emerald">
            <Check className="size-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
