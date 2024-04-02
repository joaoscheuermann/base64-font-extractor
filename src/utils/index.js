export const capitalizeFirstLetter = (string) => {
  return (string.charAt(0).toUpperCase() + string.slice(1)).trim();
}

export const parseFontName = (currentFontName) => {
  const wheights = [
    /(extra|semi)?-?light/,
    /(extra|semi)?-?thin/,
    /regular/,
    /medium/,
    /(semi|extra)?-?bold/,
    /(semi|extra)?-?black/,
  ]

  const styles = [
    /italic/,
    /oblique/,
  ]

  const dictionary = [
    ...wheights,
    ...styles,
  ]

  const segments = currentFontName.split(/-|_/)

  const result = dictionary
    .reduce((segments, word) => {
      return segments.map((segment) => {
        const match = segment.match(word)

        return match
          ? [segment.substring(0, match.index), segment.substring(match.index, segment.length)]
          : segment
      }
      ).flat()
    }, segments)
    .filter((segment) => segment)

  const fontFamily = result
    .filter((segment) => !dictionary.some(regex => regex.test(segment)))
    .map(capitalizeFirstLetter)
    .join(' ')

  const fontSubFamily = result
    .filter((segment) => dictionary.some(regex => regex.test(segment)))
    .map(capitalizeFirstLetter)
    .join(' ')

  // TODO: fix fontWheight
  const fontWheight = result
    .filter((segment) => wheights.some(regex => regex.test(segment)))
    .map(capitalizeFirstLetter)
    .join(' ')

  return {
    inputName: currentFontName,
    exportName: `${fontFamily} ${fontSubFamily}`.toLowerCase().replace(/ /g, '_'),
    fontFamily,
    fontSubFamily: fontSubFamily.length ? fontSubFamily : 'Regular',
    fontWheight: fontWheight.length ? fontWheight : 'Regular',
  }
}