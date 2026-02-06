function round1(n) {
  return Math.round(n * 10) / 10
}

export function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M${round1(points[0].x)},${round1(points[0].y)}`
  for (let i = 0; i < points.length - 1; i++) {
    const mx = round1((points[i].x + points[i + 1].x) / 2)
    d += ` C${mx},${round1(points[i].y)} ${mx},${round1(points[i + 1].y)} ${round1(points[i + 1].x)},${round1(points[i + 1].y)}`
  }
  return d
}

export function valuesToPoints(values, width, height, padding = 5) {
  const max = Math.max(...values, 1)
  const usable = height - padding * 2
  return values.map((v, i) => ({
    x: values.length > 1 ? (i / (values.length - 1)) * width : width / 2,
    y: padding + usable - (v / max) * usable,
  }))
}
