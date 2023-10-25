import styles from './page.module.css'
import UploadArea from '@/app/components/upload'
// import './components/upload';

export default function Home() {
  return (
    <main className={styles.center}>
      <header className={styles.description}>
        <p>
          Resumable uploads demo
        </p>
      </header>

      <div className={styles.center}>
        <UploadArea />
      </div>
    </main>
  )
}
