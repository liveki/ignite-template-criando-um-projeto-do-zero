import { GetStaticPaths, GetStaticProps } from 'next';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';
import Header from '../../components/Header';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const { isFallback } = useRouter();

  if (isFallback)
    return <span>Carregando...</span>;

  const estimatedReadingTimeInMinutes = Math.ceil(post.data.content.reduce((total, cur) => {
    total += cur.heading.split('').length;

    const sections = cur.body.map(section => section.text.split(' ').length);

    sections.map(word => total += word);

    return total;
  }, 0) / 200);

  return (
    <>
      <Head>
        <title>Spacetraveling | {post.data.title}</title>
      </Head>

      <Header />

      <div
        className={styles.banner}
        style={{
          backgroundImage: `url(${post.data.banner.url})`,
        }}
      />

      <main className={`${commonStyles.contentContainer} ${styles.container}`}>
        <h1>{post.data.title}</h1>

        <ul className={commonStyles.postDescription}>
          <li>
            <FiCalendar size={20} />
            <small>{format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            )}</small>
          </li>
          <li>
            <FiUser size={20} />
            <small>{post.data.author}</small>
          </li>
          <li>
            <FiClock size={20} />
            <small>{`${estimatedReadingTimeInMinutes} min`}</small>
          </li>
        </ul>

        {post.data.content.map(section => (
          <div key={section.heading} className={styles.section}>
            <strong>{section.heading}</strong>

            <div dangerouslySetInnerHTML={{
              __html: RichText.asHtml(section.body),
            }} />
          </div>
        )
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post')
  );

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid }
    }
  })

  return {
    paths: paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { params } = context;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(params.slug), {});


  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      subtitle: response.data.subtitle,
      title: response.data.title,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      })
    }
  }

  return {
    props: {
      post,
    },
  };
};
