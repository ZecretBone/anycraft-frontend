

// import * as React from 'react';
// import { apiCombine, apiGetBaseElements, apiGetChallenges } from '@/lib/composeApi';
// import type { Element, ChallengeItem } from '@/types/compose';

// export function useComposeApi() {
//   const [baseElements, setBaseElements] = React.useState<Element[] | null>(null);
//   const [loadingBase, setLoadingBase] = React.useState(false);
//   const [challenges, setChallenges] = React.useState<ChallengeItem[]>([]);
//   const [loadingChallenges, setLoadingChallenges] = React.useState(false);

//   const loadBase = React.useCallback(async () => {
//     setLoadingBase(true);
//     try {
//       const res = await apiGetBaseElements();
//       setBaseElements(res.items);
//     } finally {
//       setLoadingBase(false);
//     }
//   }, []);

//   const loadChallenges = React.useCallback(async (discoveredCharacterIds: number[]) => {
//     setLoadingChallenges(true);
//     try {
//       const res = await apiGetChallenges(discoveredCharacterIds);
//       setChallenges(res.items);
//     } finally {
//       setLoadingChallenges(false);
//     }
//   }, []);

//   const combine = React.useCallback(async (aId: number, bId: number) => {
//     const res = await apiCombine(aId, bId);
//     return res; // caller decides how to update UI (inventory vs character modal)
//   }, []);

//   return {
//     baseElements, loadingBase, loadBase,
//     challenges, loadingChallenges, loadChallenges,
//     combine,
//   };
// }

"use client";

import * as React from "react";
import { apiCombine, apiGetBaseElements, apiGetChallenges } from "@/lib/composeApi";
import type { Element, ChallengeItem } from "@/types/compose";

export function useComposeApi() {
  const [baseElements, setBaseElements] = React.useState<Element[] | null>(null);
  const [loadingBase, setLoadingBase] = React.useState(false);
  const [challenges, setChallenges] = React.useState<ChallengeItem[]>([]);
  const [loadingChallenges, setLoadingChallenges] = React.useState(false);

  const loadBase = React.useCallback(async () => {
    setLoadingBase(true);
    try {
      const res = await apiGetBaseElements();
      setBaseElements(res.items);
    } finally {
      setLoadingBase(false);
    }
  }, []);

  const loadChallenges = React.useCallback(async (discoveredCharacterIds: number[]) => {
    setLoadingChallenges(true);
    try {
      const res = await apiGetChallenges(discoveredCharacterIds);
      setChallenges(res.items);
    } finally {
      setLoadingChallenges(false);
    }
  }, []);

  const combine = React.useCallback(async (aId: number, bId: number) => {
    return apiCombine(aId, bId);
  }, []);

  return {
    baseElements, loadingBase, loadBase,
    challenges, loadingChallenges, loadChallenges,
    combine,
  };
}
