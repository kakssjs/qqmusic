export function allowBackgroundVideo(options: {reduced: boolean; limitedData: boolean; touchPoints: number; coarsePointer: boolean; compactViewport?: boolean}) {
  // Touch browsers may promote even playsInline video into a native layer.
  // Keep decorative media as images on tablets, including those with a trackpad.
  return !options.reduced && !options.limitedData && options.touchPoints === 0 && !options.coarsePointer && !options.compactViewport;
}
