import Image from "next/image";
import Link from "next/link";
import BackButton from "./BackButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Registrarse | Eloy Walls",
  description: "Crea tu cuenta de Eloy Walls.",
};

export default function RegisterPage() {
  return (
    <main className={styles.page} data-auth-page>
      <section className={styles.card} aria-labelledby="register-title">
        <BackButton />

        <div className={styles.logoWrap}>
          <span className={styles.logoWord}>eloy</span>
          <Image
            src="/SVG/ew_isotipo.svg"
            alt=""
            width={121}
            height={71}
            priority
            className={styles.logo}
          />
          <span className={`${styles.logoWord} ${styles.logoWordRight}`}>
            walls
          </span>
          <span className={styles.trademark} aria-hidden="true">®</span>
        </div>

        <div className={styles.content}>
          <h1 id="register-title" className={styles.title}>
            <span className={styles.dot} aria-hidden="true" />
            SIGNUP/ REGISTRARSE
          </h1>

          <form className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">NOMBRE DE USUARIO</label>
              <input id="name" name="name" type="text" autoComplete="username" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">CORREO ELECTRÓNICO</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="age">EDAD</label>
              <input id="age" name="age" type="number" inputMode="numeric" min="13" max="120" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">CONTRASEÑA</label>
              <input id="password" name="password" type="password" autoComplete="new-password" minLength="8" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm-password">CONFIRMAR CONTRASEÑA</label>
              <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required />
            </div>

            <div className={styles.socialLogin} aria-label="Opciones de registro">
              <span className={styles.socialTitle}>O REGÍSTRATE CON</span>
              <div className={styles.socialButtons}>
                <button type="button" className={styles.socialButton}>
                  <span className={`${styles.socialIcon} ${styles.googleIcon}`} aria-hidden="true">G</span>
                  Google
                </button>
                <button type="button" className={styles.socialButton}>
                  <span className={`${styles.socialIcon} ${styles.facebookIcon}`} aria-hidden="true">f</span>
                  Facebook
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitButton}>REGISTRARME</button>
          </form>

          <Link href="/login" className={styles.loginLink}>YA TENGO UNA CUENTA</Link>
        </div>
      </section>
    </main>
  );
}
