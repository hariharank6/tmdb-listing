import React, { MutableRefObject } from 'react'
import NextImage from 'next/image'
import styles from './MovieCard.module.css'
import StarIcon from '../../../public/icons/star'
import CalendarIcon from '../../../public/icons/calendar'
import { MovieCardProps } from './types'

export const MovieCard = React.forwardRef<HTMLDivElement, MovieCardProps>(function MovieCard({
  id,
  rank,
  image,
  title,
  rating,
  loading,
  releasedYear,
  isHighlighted,
  handleHighlight,
  isHighlightedRowMovie,
}, ref) {
  return (
    <div
      className={`
        ${styles.movieCardContainer}
        ${loading ? styles.loading : ''}
        ${isHighlightedRowMovie ? styles.highlightedMovieCardContainer : ''}
      `}>
      <div className={styles.movieCard} ref={(elementRef) => {
        if( elementRef) {
          (ref as MutableRefObject<HTMLDivElement>).current = elementRef
        }
      }}>
        <a href={`https://www.themoviedb.org/movie/${id}`} className={styles.movieCardContent}>
          <div
            className={`
              ${styles.highlightContainer}
              ${isHighlightedRowMovie && !isHighlighted ? styles.hidden : ''}
            `}>
            <button
              onClick={event => handleHighlight(event, id)}
              className={`
                ${styles.highlight}
                ${isHighlighted ? styles.highlightStar : ''}
              `}>
              <StarIcon width="20" height="20" fill={isHighlighted ? 'yellow' : '#ccced7'} />
            </button>
          </div>
          <div className={styles.movieImageContainer}>
            {!loading && <NextImage layout="fill" src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_PREFIX}${image}`} />}
          </div>
          <div className={styles.movieInfoContainer}>
            <div className={styles.movieTitle}>
              <span className={styles.rank}>#{rank}</span>
              <span>{title}</span>
            </div>
            <div className={styles.moreInfo}>
              <div className={styles.yearInfo}>
                {!loading && (
                  <div className={styles.calendarIcon}>
                    <CalendarIcon fill={'red'} width="20" height="20" />
                  </div>
                )}
                <div className={styles.releasedYear}>{releasedYear}</div>
              </div>

              <div className={styles.ratingInfo}>
                <div className={styles.starIcon}>
                  <StarIcon fill={'yellow'} width="20" height="20" />
                </div>
                <div className={styles.rating}>{rating}</div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
)
