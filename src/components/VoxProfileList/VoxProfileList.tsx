import type { VoxProfileMeta } from "../../services/voxService"

import styles from "./VoxProfileList.module.css"

interface Props {
  profiles: VoxProfileMeta[]
  selected: string
  onSelect: (key: string) => void
  onOpenDetails: (key: string) => void
  disabled?: boolean
}

/*
Lista de perfis em estilo seleção (radiogroup). Usada tanto no painel de
Configurações do Vox quanto no card de novidade (onboarding).
*/
export default function VoxProfileList({
  profiles,
  selected,
  onSelect,
  onOpenDetails,
  disabled = false,
}: Props) {
  return (
    <div className={styles.list} role="radiogroup" aria-label="Perfil de resposta do Vox">
      {profiles.map((profile) => {
        const isSelected = profile.key === selected

        return (
          <div
            key={profile.key}
            role="radio"
            aria-checked={isSelected}
            tabIndex={disabled ? -1 : 0}
            className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
            onClick={() => !disabled && onSelect(profile.key)}
            onKeyDown={(e) => {
              if (disabled) return
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect(profile.key)
              }
            }}
          >
            <span className={`${styles.radio} ${isSelected ? styles.radioOn : ""}`}>
              {isSelected && <span className={styles.radioDot} />}
            </span>

            <div className={styles.body}>
              <p className={styles.label}>{profile.label}</p>
              <p className={styles.short}>{profile.short}</p>
              <button
                type="button"
                className={styles.detailsLink}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenDetails(profile.key)
                }}
              >
                Ver em detalhes
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
