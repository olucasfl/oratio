import { useState, useEffect } from "react";
import frasesData from "../data/frases-diarias.json";

interface Frase {
  id: number;
  texto: string;
  autor: string;
  origem: string;
  referencia: string;
  categoria: string;
}

interface FraseDiariaState {
  data: string;
  fraseId: number;
  resgatada: boolean;
}

interface HistoricoEntry {
  id: number;
  data: string;
}

const STORAGE_KEY = "oratio_frase_dia";
const HISTORICO_KEY = "oratio_frases_historico";
const JANELA_DIAS = 30;

function getDataHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function diffDias(dataA: string, dataB: string): number {
  return Math.floor(
    (new Date(dataB).getTime() - new Date(dataA).getTime()) / 86_400_000
  );
}

function sortearFrase(frases: Frase[]): Frase {
  const hoje = getDataHoje();
  const raw = localStorage.getItem(HISTORICO_KEY);
  let historico: HistoricoEntry[] = raw ? JSON.parse(raw) : [];

  // remove entradas mais antigas que a janela
  historico = historico.filter((e) => diffDias(e.data, hoje) < JANELA_DIAS);

  const idsRecentes = new Set(historico.map((e) => e.id));
  let disponiveis = frases.filter((f) => !idsRecentes.has(f.id));

  // se todas já apareceram na janela, reinicia o histórico
  if (disponiveis.length === 0) {
    historico = [];
    disponiveis = frases;
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
  }

  const sorteada = disponiveis[Math.floor(Math.random() * disponiveis.length)];

  historico.push({ id: sorteada.id, data: hoje });
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));

  return sorteada;
}

export function useFraseDiaria() {
  const frases = frasesData.frases as Frase[];

  const [frase, setFrase] = useState<Frase | null>(null);
  const [resgatada, setResgatada] = useState(false);

  useEffect(() => {
    const hoje = getDataHoje();
    const raw = localStorage.getItem(STORAGE_KEY);
    let state: FraseDiariaState | null = raw ? JSON.parse(raw) : null;

    if (!state || state.data !== hoje) {
      const sorteada = sortearFrase(frases);
      state = { data: hoje, fraseId: sorteada.id, resgatada: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    const fraseDodia = frases.find((f) => f.id === state!.fraseId) ?? null;
    setFrase(fraseDodia);
    setResgatada(state.resgatada);
  }, []);

  function resgatar() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const state: FraseDiariaState = JSON.parse(raw);
    const updated = { ...state, resgatada: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setResgatada(true);
  }

  return { frase, resgatada, resgatar };
}
