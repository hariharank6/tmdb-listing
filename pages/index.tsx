import type { NextPage } from 'next'
import Head from 'next/head'
import { useMemo, useState } from 'react'
import { Heading, MoviesList, Select } from '../components'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')

  const SORT_OPTIONS = useMemo(
    () => [
      {
        label: 'Ascending',
        value: 'asc'
      },
      {
        label: 'Descending',
        value: 'desc'
      }
    ],
    []
  )

  const handleSortChange = (sortValue: string) => {
    if (sortValue === 'asc' || sortValue === 'desc') {
      setSort(sortValue)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Top 500 TMDB movies</title>
        <meta name="description" content="TMDB's most popular movies" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.headerContainer}>
          <Heading title="Top 500 TMDB movies" />
          <Select options={SORT_OPTIONS} handleChange={handleSortChange} defaultValue={sort} label="Sort By Rank: " />
        </div>
        <MoviesList sortBy={sort} />
      </main>
    </div>
  )
}

export default Home
