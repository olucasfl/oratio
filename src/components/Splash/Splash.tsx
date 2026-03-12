import styles from "./Splash.module.css"

export default function Splash(){

 return(

  <div className={styles.splash}>

   <div className={styles.logoBox}>

    <div className={styles.logoGlow}></div>

    <img
     src="/icon-noBack-512.png"
     alt="Oratio Logo"
     className={styles.logo}
    />

    <div className={styles.logoShine}></div>

    <h1 className={styles.title}>
     Oratio
    </h1>

    <p className={styles.subtitle}>
     Aplicativo de espiritualidade católica
    </p>

   </div>

   <div className={styles.loader}>

    <span></span>
    <span></span>
    <span></span>

   </div>

  </div>

 )

}