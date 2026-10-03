import Image from "next/image";
import Link from "next/link";
import BackButton from "./BackButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Iniciar sesión | Eloy Walls",
  description: "Accede a tu cuenta de Eloy Walls.",
};

export default function LoginPage() {
  return (
    <main className={styles.page} data-auth-page>
      <section className={styles.card} aria-labelledby="login-title">
        <BackButton />

        <div className={styles.logoWrap}>
          <span className={styles.logoWord}>eloy</span>
          <Image
            src="/SVG/ew_white.svg"
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
          <h1 id="login-title" className={styles.title}>
            <span className={styles.dot} aria-hidden="true" />
            LOG IN/ INICIAR
          </h1>

          <form className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="username">
                NOMBRE DE USUARIO
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">
                CONTRASEÑA
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className={styles.srOnly}>
              INICIAR SESIÓN
            </button>
          </form>

          <div className={styles.socialLogin} aria-label="Opciones de inicio de sesión">
            <span className={styles.socialTitle}>O INICIA SESIÓN CON</span>
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
        </div>

        <Link href="/register" className={styles.registerLink}>
          REGÍSTRATE
        </Link>
      </section>
    </main>
  );
}
