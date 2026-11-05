"use client";

import { useEffect, useState } from "react";

export function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- read the clock only on the client
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <span>{year ?? ""}</span>;
}
