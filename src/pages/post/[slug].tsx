import { GetStaticPaths, GetStaticProps } from 'next';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { differenceInMinutes } from 'date-fns';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

  console.log(RichText.asText(post.data.content[0].body));

  // const estimatedReadingTimeInMinutes = post.data.content.reduce((acc, cur) => {
  //   console.log(cur.body);

  //   const totalWords = RichText.asText(cur.body).split(/\b($word)\b/i).length;
  //   return acc + (totalWords * 5 / 60); // 5 = seconds per word
  // }, 0);

  return (
    <>
      <div
        className={styles.banner}
        style={{
          backgroundImage: `url(${post.data.banner.url})`,
        }}
      />

      <main className={commonStyles.contentContainer}>
        <ul className={commonStyles.postDescription}>
          <li>
            <FiCalendar size={20} />
            <small>{post.first_publication_date}</small>
          </li>
          <li>
            <FiUser size={20} />
            <small>{post.data.author}</small>
          </li>
        </ul>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { params } = context;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(params.slug), {});


  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      title: response.data.title,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: RichText.asHtml(content.body),
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
