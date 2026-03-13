import styles from "./Splash.module.css"

export default function Splash(){

 return(

  <div className={styles.splash}>

   <div className={styles.logoContainer}>

    <img
     src="/icon-noBack-512.png"
     alt="Oratio Logo"
     className={styles.logo}
    />

   </div>

   <h1 className={styles.title}>
    ORATIO
   </h1>

   <p className={styles.subtitle}>
    Aplicativo de espiritualidade católica
   </p>

   <div className={styles.loader}>

    <div></div>
    <div></div>
    <div></div>

   </div>

  </div>

 )

}