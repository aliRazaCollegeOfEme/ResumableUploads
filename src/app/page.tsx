import styles from './page.module.css'
import UploadArea from '@/app/components/upload'
// import './components/upload';

export default function Home() {
  return (
    <main className={styles.center}>
      <div className={styles.description}>
        Resumable uploads demo
      </div>

      <div className={styles.center} id='dashboard'>
        <UploadArea />
      </div>
    </main>
  )
}
