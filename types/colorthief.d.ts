declare module 'colorthief' {
  type RGBColor = [number, number, number];

  export default class ColorThief {
    /**
     * Get the dominant color from the image.
     * @param img - Image element or path
     * @param quality - Quality (1 = highest, 10 = default)
     * @returns RGB color array [r, g, b]
     */
    getColor(img: HTMLImageElement | string, quality?: number): RGBColor;

    /**
     * Get a palette of colors from the image.
     * @param img - Image element or path
     * @param colorCount - Number of colors to get (2-10)
     * @param quality - Quality (1 = highest, 10 = default)
     * @returns Array of RGB color arrays
     */
    getPalette(
      img: HTMLImageElement | string,
      colorCount?: number,
      quality?: number
    ): RGBColor[];
  }
}
