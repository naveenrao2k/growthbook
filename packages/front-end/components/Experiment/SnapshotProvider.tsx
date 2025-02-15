import React, { useState, ReactNode, useContext } from "react";
import { ExperimentInterfaceStringDates } from "back-end/types/experiment";
import {
  ExperimentSnapshotAnalysis,
  ExperimentSnapshotInterface,
} from "back-end/types/experiment-snapshot";
import { getSnapshotAnalysis } from "@/../shared/util";
import useApi from "@/hooks/useApi";

const snapshotContext = React.createContext<{
  experiment?: ExperimentInterfaceStringDates;
  snapshot?: ExperimentSnapshotInterface;
  analysis?: ExperimentSnapshotAnalysis | undefined;
  latestAnalysis?: ExperimentSnapshotAnalysis | undefined;
  latest?: ExperimentSnapshotInterface;
  mutateSnapshot: () => void;
  phase: number;
  dimension: string;
  setPhase: (phase: number) => void;
  setDimension: (dimension: string) => void;
  error?: Error;
}>({
  phase: 0,
  dimension: "",
  setPhase: () => {
    // do nothing
  },
  setDimension: () => {
    // do nothing
  },
  mutateSnapshot: () => {
    // do nothing
  },
});

export default function SnapshotProvider({
  experiment,
  children,
}: {
  experiment: ExperimentInterfaceStringDates;
  children: ReactNode;
}) {
  const [phase, setPhase] = useState(experiment.phases?.length - 1 || 0);
  const [dimension, setDimension] = useState("");

  const { data, error, mutate } = useApi<{
    snapshot: ExperimentSnapshotInterface;
    latest?: ExperimentSnapshotInterface;
  }>(
    `/experiment/${experiment.id}/snapshot/${phase}` +
      (dimension ? "/" + dimension : "")
  );

  return (
    <snapshotContext.Provider
      value={{
        experiment,
        snapshot: data?.snapshot,
        latest: data?.latest,
        analysis: data?.snapshot
          ? getSnapshotAnalysis(data?.snapshot) ?? undefined
          : undefined,
        latestAnalysis: data?.latest
          ? getSnapshotAnalysis(data?.latest) ?? undefined
          : undefined,
        mutateSnapshot: mutate,
        phase,
        dimension,
        setPhase,
        setDimension,
        error,
      }}
    >
      {children}
    </snapshotContext.Provider>
  );
}

export function useSnapshot() {
  return useContext(snapshotContext);
}
