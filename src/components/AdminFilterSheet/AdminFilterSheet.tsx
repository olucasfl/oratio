import { createPortal } from "react-dom"
import { Loader2, X } from "lucide-react"
import styles from "./AdminFilterSheet.module.css"

type FilterRole = "all" | "admin" | "normal"
type FilterVerif = "all" | "verified" | "unverified"
type FilterActivity = "all" | "7d" | "30d"

interface Props {
  open: boolean
  onClose: () => void
  usersLoading: boolean
  filterRole: FilterRole
  setFilterRole: (v: FilterRole) => void
  filterVerif: FilterVerif
  setFilterVerif: (v: FilterVerif) => void
  filterActive: FilterActivity
  setFilterActive: (v: FilterActivity) => void
  onClear: () => void
  activeCount: number
}

export default function AdminFilterSheet({
  open, onClose, usersLoading,
  filterRole, setFilterRole,
  filterVerif, setFilterVerif,
  filterActive, setFilterActive,
  onClear, activeCount,
}: Props) {

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.handle} />

        <div className={styles.header}>
          <h3>Filtros</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={18}/>
          </button>
        </div>

        <div className={styles.body}>

          <div className={styles.group}>
            <label>Cargo</label>
            <div className={styles.row}>
              {(["all", "admin", "normal"] as FilterRole[]).map(v => (
                <button
                  key={v}
                  className={`${styles.chip} ${filterRole === v ? styles.chipOn : ""}`}
                  onClick={() => setFilterRole(v)}
                >
                  {usersLoading && filterRole === v && <Loader2 size={11} className={styles.spin}/>}
                  {v === "all" ? "Todos" : v === "admin" ? "Admin" : "Normal"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <label>Verificação</label>
            <div className={styles.row}>
              {(["all", "verified", "unverified"] as FilterVerif[]).map(v => (
                <button
                  key={v}
                  className={`${styles.chip} ${filterVerif === v ? styles.chipOn : ""}`}
                  onClick={() => setFilterVerif(v)}
                >
                  {usersLoading && filterVerif === v && <Loader2 size={11} className={styles.spin}/>}
                  {v === "all" ? "Todos" : v === "verified" ? "Verificados" : "Não verif."}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <label>Atividade</label>
            <div className={styles.row}>
              {(["all", "7d", "30d"] as FilterActivity[]).map(v => (
                <button
                  key={v}
                  className={`${styles.chip} ${filterActive === v ? styles.chipOn : ""}`}
                  onClick={() => setFilterActive(v)}
                >
                  {usersLoading && filterActive === v && <Loader2 size={11} className={styles.spin}/>}
                  {v === "all" ? "Todos" : v === "7d" ? "7 dias" : "30 dias"}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <button
            className={styles.clearBtn}
            onClick={onClear}
            disabled={activeCount === 0}
          >
            Limpar filtros
          </button>
          <button className={styles.applyBtn} onClick={onClose}>
            Ver resultados
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}
