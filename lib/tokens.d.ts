export type TokenScale<T extends string | number = string> = Record<string, T>

export interface TypographyToken {
  size: string
  weight: number
  lineHeight: string
  letterSpacing?: string
  color?: string
}

export interface Tokens {
  colors: TokenScale<string>
  spacing: TokenScale<number>
  typography: {
    fontFamily: string
    scale: Record<string, TypographyToken>
  }
  radii: TokenScale<number>
  shadows: TokenScale<string>
  layout: {
    sidebarWidth: number
    containerMaxWidth: number
    pageMargin: number
    cardPadding: number
    gutter: number
  }
}

export declare const colors: TokenScale<string>
export declare const spacing: TokenScale<number>
export declare const typography: Tokens["typography"]
export declare const radii: TokenScale<number>
export declare const shadows: TokenScale<string>
export declare const layout: Tokens["layout"]
export declare const tokens: Tokens

