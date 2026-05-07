"use client";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { LEADERBOARD_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { useState } from "react";

export function useLeaderboard() {
  const { data: topPlayers, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: "getTopPlayers",
  });

  return { topPlayers: topPlayers ?? [], refetch };
}

export function usePlayerData(address?: `0x${string}`) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: "getPlayerData",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return data;
}

export function useSubmitScore() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submit = (score: number, nickname: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LEADERBOARD_ABI,
      functionName: "submitScore",
      args: [BigInt(score), nickname],
    });
  };

  return {
    submit,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
