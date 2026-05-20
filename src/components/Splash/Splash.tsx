import styles from "./Splash.module.css"

export default function Splash(){

  return(

    <div className={styles.splash}>

      {/* BACKGROUND GLOW */}
      <div className={styles.glowTop}></div>
      <div className={styles.glowBottom}></div>

      {/* PARTICLES */}
      <div className={styles.particles}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* CARD */}
      <div className={styles.content}>

        <div className={styles.logoWrapper}>

          <div className={styles.logoRing}></div>

          <div className={styles.logoContainer}>

            <img
              src="/icon-noBack-512.png"
              alt="Oratio Logo"
              className={styles.logo}
            />

          </div>

        </div>

        <div className={styles.textArea}>

          <span className={styles.badge}>
            ✠ Aplicativo Católico
          </span>

          <h1 className={styles.title}>
            ORATIO
          </h1>

          <p className={styles.subtitle}>
            Reze. Medite. Caminhe diariamente com Cristo.
          </p>

        </div>

        {/* LOADER */}
        <div className={styles.loader}>

          <div className={styles.loaderBar}></div>

        </div>

      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <span>© Oratio</span>
      </div>

    </div>

  )

}