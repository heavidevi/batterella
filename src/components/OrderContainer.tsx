import { ReactNode } from 'react';
import styles from './OrderContainer.module.css';

interface OrderContainerProps {
  children: ReactNode;
  title: string;
  step?: number;
  totalSteps?: number;
}

export default function OrderContainer({ 
  children, 
  title, 
  step = 1, 
  totalSteps = 3 
}: OrderContainerProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <span className={styles.stepText}>Step {step} of {totalSteps}</span>
        </div>
        <h1 className={styles.title}>{title}</h1>
      </header>
      
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
