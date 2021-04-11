import Link from 'next/link';

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <header className={`${styles.container} ${commonStyles.contentContainer}`}>
      <Link href="/">
        <a>
          <img src="icons/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
