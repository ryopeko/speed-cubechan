"use client";

import { useSyncExternalStore } from "react";

/*
 * ドパモード: a hidden party mode, switched on by clicking the mascot on a
 * pattern page. Kept in memory only, so a reload turns it off.
 */

let on = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setDopa(value: boolean) {
  if (on === value) return;
  on = value;
  listeners.forEach((l) => l());
}

/** Call `listener` whenever the mode turns on or off. Returns an unsubscribe function. */
export function onDopaChange(listener: (on: boolean) => void) {
  const l = () => listener(on);
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useDopa(): boolean {
  return useSyncExternalStore(subscribe, () => on, () => false);
}

/** An effect to play: the mode switched on, a move finished, or the whole algorithm finished. */
export type DopaEvent = { kind: "start" } | { kind: "move"; label: string } | { kind: "done" };

const effectListeners = new Set<(e: DopaEvent) => void>();

export function onDopaEvent(listener: (e: DopaEvent) => void) {
  effectListeners.add(listener);
  return () => {
    effectListeners.delete(listener);
  };
}

/** Play an effect. Does nothing unless the mode is on. */
export function emitDopa(event: DopaEvent) {
  if (on) effectListeners.forEach((l) => l(event));
}
