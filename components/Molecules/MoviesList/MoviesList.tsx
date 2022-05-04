import React, { useRef, useState, useEffect, useCallback, ReactElement } from 'react'
import { GridChildComponentProps, VariableSizeGrid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import InfiniteLoader from 'react-window-infinite-loader'

import styles from './MoviesList.module.css'
import { MovieCard, MovieProps } from '../../Atoms'
import { addMovieToStorage, getStorageValue, removeMovieToStorage } from '../../../utils'
import { MoviesListProps, GridSpecsProps, movieResponseType } from './types'

const MAX_API_RESPONSE = 20

export const MoviesList = ({ sortBy, maxLimit = 500 }: MoviesListProps): ReactElement => {
  const gridRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const lastLoadedPage = useRef<number>(0)
  const [moviesList, setMoviesList] = useState<MovieProps[] | []>([])
  const [gridSpecs, setGridSpecs] = useState<GridSpecsProps>({
    rowCount: 5,
    columnCount: 6,
    rowHeight: 310,
    columnWidth: 180
  })

  // To calculate the grid dimensions
  const updateGridSpecs = useCallback((resetPosition?:boolean) => {
    if(!!resetPosition) {
      gridRef.current.scrollToItem({ align: 'smart', columnIndex: 0, rowIndex: 0 });
    }

    if (containerRef.current && cardRef.current && gridRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const columnCount = Math.floor(containerWidth / (cardRef.current.clientWidth + 30)) || 1
      const rowCount = Math.ceil(maxLimit / columnCount)
      const columnWidth = containerWidth / columnCount

      setGridSpecs({
        columnCount,
        rowCount,
        columnWidth,
        rowHeight: cardRef.current.clientHeight + 30
      })

      gridRef.current.resetAfterIndices({
        columnIndex: 0,
        rowIndex: 0,
        shouldForceUpdate: true
      })
    }
  }, [maxLimit])

  // To update the movies present in the highlighted row
  const getHighlightedRowMovies = useCallback(
    (updatedMoviesList: MovieProps[]) => {
      if (updatedMoviesList.length) {
        const highlightedMovieIds: string[] = getStorageValue('highlightedMovies')
        const highlightedRowMoviesIds: string[] = []

        updatedMoviesList.forEach((movie, index: number) => {
          if (highlightedMovieIds?.includes(movie.id)) {
            const movieRow = Math.ceil((index + 1) / gridRef.current.props.columnCount)
            const movieRowStart = movieRow * gridRef.current.props.columnCount - gridRef.current.props.columnCount
            const movieRowEnd = movieRow * gridRef.current.props.columnCount
            for (let start = movieRowStart; start < movieRowEnd && start < maxLimit; start++) {
              if(start < updatedMoviesList.length) {
                highlightedRowMoviesIds.push(updatedMoviesList[start].id)
              }
            }
          }
        })

        const newList = updatedMoviesList.map((movie, index: number) => ({
          ...movie,
          rank: sortBy === 'asc' ? index + 1 : maxLimit - index,
          isHighlightedRowMovie: highlightedRowMoviesIds.includes(movie.id)
        }))

        return newList
      }
      return []
    },
    [maxLimit, sortBy]
  )

  // Parses the movie data from API and updates to the movie list state
  const addMoviesToList = useCallback(
    (data: movieResponseType[]) => {
      const alreadyHighlightedMovies: string[] = getStorageValue('highlightedMovies')
      const formattedData: MovieProps[] = data.map(
        ({ id, title, poster_path, release_date, vote_average }: movieResponseType, index: number) => ({
          id,
          title,
          image: poster_path,
          rating: vote_average,
          rank: index,
          releasedYear: release_date.split('-')[0],
          isHighlighted: !!alreadyHighlightedMovies?.includes(id)
        })
      )

      setMoviesList(prev => getHighlightedRowMovies([...prev, ...formattedData]))
    },
    [getHighlightedRowMovies]
  )

  // To handle the highlight functionality
  const handleHighlight = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
      event?.preventDefault()
      setMoviesList((previousMoviesList: MovieProps[]) => {
        const highlightedMovieList = previousMoviesList.map(movie => {
          if (movie.id === id) {
            if (movie.isHighlighted) {
              removeMovieToStorage(id)
            } else {
              addMovieToStorage(id)
            }
            return {
              ...movie,
              isHighlighted: !movie.isHighlighted
            }
          }
          return movie
        })

        return getHighlightedRowMovies(highlightedMovieList)
      })
    },
    [getHighlightedRowMovies]
  )

  // To load movies from API. It'll be called automatically by the virtualization library
  const loadMovies = useCallback(
    async (startIndex: number, endIndex: number) => {
      const startPage = Math.ceil((startIndex + 1) / MAX_API_RESPONSE)
      const endPage = Math.ceil((endIndex + 1) / MAX_API_RESPONSE)
      const networkCalls: Promise<Response>[] = []
      for (let i = startPage; i <= endPage; i++) {
        if (i > lastLoadedPage.current) {
          networkCalls.push(
            fetch(
              `${process.env.NEXT_PUBLIC_TMDB_API_ENDPOINT}/3/movie/top_rated?api_key=${
                process.env.NEXT_PUBLIC_TMDB_API_KEY
              }&language=en-US&page=${sortBy === 'asc' ? i : maxLimit / MAX_API_RESPONSE - i + 1}`
            )
              .then(res => res.json())
              .then(resp => {
                return Promise.resolve(sortBy === 'asc' ? resp.results : resp.results.reverse())
              })
          )
        }
      }
      lastLoadedPage.current = endPage

      try {
        const response = await Promise.allSettled(networkCalls)
        const results = response.map(result => {
          if (result.status === 'fulfilled') {
            return result.value
          }
        })
        addMoviesToList(results.flat() as unknown as movieResponseType[])
      } catch (error) {
        console.log('Error: ', error)
      }
    },
    [addMoviesToList, maxLimit, sortBy]
  )

  // Renders the content of each Cell. It'll be called automatically by the virtualization library
  const Cell = useCallback(
    ({ rowIndex, columnIndex, data, style }:GridChildComponentProps) => {
      const index = rowIndex * gridSpecs.columnCount + columnIndex;
      if (index + 1 > maxLimit) return null
      const cardData = data[index] ?? {}

      return (
        <div style={style}>
          <MovieCard {...cardData} ref={cardRef} loading={Object.keys(cardData).length === 0} handleHighlight={handleHighlight} />
        </div>
      )
    },
    [gridSpecs.columnCount, handleHighlight, maxLimit]
  )

  // Event binding and spec generation on client-side mount
  useEffect(() => {
    setTimeout(() => updateGridSpecs())
    window.addEventListener('resize', () => updateGridSpecs())
    window.addEventListener('orientationChange', () => updateGridSpecs(true)); //For IE compatibility
    if (screen.orientation) {
      screen.orientation.addEventListener("change", () => updateGridSpecs(true));
    }
  }, [updateGridSpecs])

  // Effect to dynamically calculate the highlighted row and its contents
  useEffect(() => {
    if (moviesList.length) {
      setMoviesList((previousMoviesList: MovieProps[]) => getHighlightedRowMovies(previousMoviesList))
    }
  }, [getHighlightedRowMovies, moviesList.length, gridSpecs.columnCount])

  // Effect for sortBy value changes
  useEffect(() => {
    if (moviesList.length) {
      setMoviesList([])
      lastLoadedPage.current = 0
      loadMovies(
        0,
        containerRef.current?.clientHeight
          ? Math.ceil(containerRef.current?.clientHeight / gridSpecs.rowHeight) * gridSpecs.columnCount
          : 45
      )
      gridRef.current.scrollToItem({ align: 'smart', columnIndex: 0, rowIndex: 0 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMovies, sortBy])

  return (
    <div ref={containerRef} className={styles.moviesContainer}>
      <AutoSizer>
        {({ width, height }) => (
          <InfiniteLoader
            threshold={gridSpecs.columnCount}
            minimumBatchSize={MAX_API_RESPONSE}
            itemCount={maxLimit}
            isItemLoaded={(index: number) => !!moviesList[index]}
            loadMoreItems={loadMovies}>
            {({ onItemsRendered, ref }) => (
              <VariableSizeGrid
                ref={gridRefInstance => {
                  ref(gridRefInstance)
                  gridRef.current = gridRefInstance
                }}
                overscanRowCount={10}
                rowCount={gridSpecs.rowCount}
                itemData={moviesList}
                rowHeight={() => gridSpecs.rowHeight}
                columnCount={gridSpecs.columnCount}
                columnWidth={() => gridSpecs.columnWidth}
                width={width}
                height={height}
                onItemsRendered={gridProps => {
                  onItemsRendered({
                    overscanStartIndex: gridProps.overscanRowStartIndex * gridSpecs.columnCount,
                    overscanStopIndex: gridProps.overscanRowStopIndex * gridSpecs.columnCount,
                    visibleStartIndex: gridProps.visibleRowStartIndex * gridSpecs.columnCount,
                    visibleStopIndex: gridProps.visibleRowStopIndex * gridSpecs.columnCount
                  })
                }}
              >
                {Cell}
              </VariableSizeGrid>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  )
}
